import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const db = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
}))

export async function GET() {
  try {
    const res = await db.send(new ScanCommand({ TableName: 'RatepayerRegistry' }))
    return NextResponse.json({ success: true, ratepayers: res.Items || [] })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    await db.send(new PutCommand({
      TableName: 'RatepayerRegistry',
      Item: {
        registration_number: body.registration_number,
        name: body.name,
        phone: body.phone,
        address: body.address || '',
        street: body.street || '',
        district: body.district || 'Colombo',
        active: true,
        payment_status: 'unpaid',
        created_at: new Date().toISOString(),
      }
    }))
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { registration_number, payment_status, active } = await req.json()
    await db.send(new UpdateCommand({
      TableName: 'RatepayerRegistry',
      Key: { registration_number },
      UpdateExpression: 'SET payment_status = :p, active = :a, updated_at = :u',
      ExpressionAttributeValues: {
        ':p': payment_status,
        ':a': active,
        ':u': new Date().toISOString(),
      }
    }))
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { registration_number } = await req.json()
    await db.send(new DeleteCommand({
      TableName: 'RatepayerRegistry',
      Key: { registration_number }
    }))
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

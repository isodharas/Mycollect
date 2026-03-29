import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})
const db = DynamoDBDocumentClient.from(client)

export async function POST(req: NextRequest) {
  try {
    const { bin_id } = await req.json()
    if (!bin_id) return NextResponse.json({ error: 'bin_id required' }, { status: 400 })

    const now = new Date().toISOString()
    const timestamp = String(Math.floor(Date.now() / 1000))

    await db.send(new PutCommand({
      TableName: 'BinLatestStatus',
      Item: {
        bin_id,
        fill_level: 0,
        gas_ppm: 0,
        temperature: 28,
        humidity: 70,
        health_risk: 0,
        priority: 0,
        priority_label: 'LOW',
        last_updated: now,
        timestamp,
        classified_by: 'Collection_Confirmed',
      },
    }))

    await db.send(new PutCommand({
      TableName: 'BinSensorData',
      Item: {
        bin_id,
        timestamp,
        fill_level: 0,
        gas_ppm: 0,
        temperature: 28,
        humidity: 70,
        health_risk: 0,
        priority: 0,
        priority_label: 'LOW',
        classified_by: 'Collection_Confirmed',
      },
    }))

    return NextResponse.json({
      success: true,
      message: bin_id + ' collected — reset to 0',
      bin_id,
      priority: 'LOW',
      health_risk: 0,
    })
  } catch (e: any) {
    console.error('Collect error:', e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

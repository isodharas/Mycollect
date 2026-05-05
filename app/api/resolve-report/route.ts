import { NextRequest, NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const db = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.MYCOLLECT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.MYCOLLECT_AWS_SECRET_ACCESS_KEY!,
  }
}))

export async function PUT(req: NextRequest) {
  try {
    const { report_id, resolved_by } = await req.json()
    await db.send(new UpdateCommand({
      TableName: 'CitizenReports',
      Key: { report_id },
      UpdateExpression: 'SET #s = :s, resolved_by = :r, resolved_at = :t',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: {
        ':s': 'resolved',
        ':r': resolved_by || 'admin',
        ':t': new Date().toISOString()
      }
    }))
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

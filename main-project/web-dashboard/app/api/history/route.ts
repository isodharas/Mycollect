import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'

const db = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
}))

export async function GET() {
  try {
    const res = await db.send(new ScanCommand({
      TableName: 'BinSensorData',
      FilterExpression: 'begins_with(bin_id, :b) AND fill_level = :f',
      ExpressionAttributeValues: { ':b': 'BIN', ':f': 0 },
      ProjectionExpression: 'bin_id, #ts, gas_ppm, priority_label',
      ExpressionAttributeNames: { '#ts': 'timestamp' },
    }))
    const items = (res.Items || []).sort((a,b) => Number(b.timestamp) - Number(a.timestamp))
    return NextResponse.json({ success: true, history: items })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

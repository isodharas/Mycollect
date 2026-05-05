import { NextResponse } from 'next/server'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'

const db = DynamoDBDocumentClient.from(new DynamoDBClient({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.MYCOLLECT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.MYCOLLECT_AWS_SECRET_ACCESS_KEY!,
  }
}))

export async function GET() {
  try {
    const res = await db.send(new ScanCommand({
      TableName: 'BinSensorData',
      FilterExpression: 'fill_level = :f',
      ExpressionAttributeValues: { ':f': 0 },
      ProjectionExpression: 'bin_id, #ts, gas_ppm, priority_label',
      ExpressionAttributeNames: { '#ts': 'timestamp' },
    }))
    const items = (res.Items || [])
      .filter((item: any) => item.bin_id?.startsWith('BIN'))
      .sort((a: any, b: any) => Number(b.timestamp) - Number(a.timestamp))
    return NextResponse.json({ success: true, history: items })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

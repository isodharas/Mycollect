import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'

function getClient() {
  return new DynamoDBClient({
    region: 'ap-southeast-2',
    credentials: {
      accessKeyId: process.env.MYCOLLECT_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.MYCOLLECT_AWS_SECRET_ACCESS_KEY!,
    },
  })
}

function getDb() {
  return DynamoDBDocumentClient.from(getClient())
}

export async function getUserByEmail(email: string) {
  try {
    const res = await getDb().send(new GetCommand({
      TableName: 'MCUsers',
      Key: { email },
    }))
    return res.Item || null
  } catch(e: any) {
    console.error('getUserByEmail error:', e.name, e.message)
    return null
  }
}

export async function createUser(user: {
  email: string
  name: string
  password: string
  role: string
  zone: string
}) {
  try {
    await getDb().send(new PutCommand({
      TableName: 'MCUsers',
      Item: {
        ...user,
        id: String(Date.now()),
        createdAt: new Date().toISOString(),
      },
      ConditionExpression: 'attribute_not_exists(email)',
    }))
    return { success: true }
  } catch (e: any) {
    console.error('createUser error:', e.name, e.message)
    if (e.name === 'ConditionalCheckFailedException') {
      return { success: false, error: 'An account with this email already exists' }
    }
    return { success: false, error: e.message || 'Failed to create account' }
  }
}

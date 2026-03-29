import { NextRequest, NextResponse } from 'next/server'
const BASE = 'https://g7oob1ovd6.execute-api.ap-southeast-2.amazonaws.com/prod'

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path') || ''
  try {
    const res = await fetch(BASE + '/' + path, { headers:{'Content-Type':'application/json'}, cache:'no-store' })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e:any) { return NextResponse.json({error:e.message},{status:500}) }
}

export async function POST(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path') || ''
  const body = await req.json()
  try {
    const res = await fetch(BASE + '/' + path, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data)
  } catch (e:any) { return NextResponse.json({error:e.message},{status:500}) }
}

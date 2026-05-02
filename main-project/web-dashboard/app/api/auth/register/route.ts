import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail, createUser } from '@/lib/dynamodb'

export async function POST(req: Request) {
  try {
    const { name, email, password, zone } = await req.json()
    console.log('Register attempt:', { name, email, zone })
    if (!name || !email || !password) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    const existing = await getUserByEmail(email)
    console.log('Existing user check:', existing)
    if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    const hashed = await bcrypt.hash(password, 10)
    const result = await createUser({ email, name, password: hashed, role: 'Municipal Operator', zone: zone || 'Homagama' })
    console.log('Create user result:', result)
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Register ERROR:', e.message, e.name)
    return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 })
  }
}

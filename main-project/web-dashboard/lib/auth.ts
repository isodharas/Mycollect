import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { getUserByEmail } from './dynamodb'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await getUserByEmail(credentials.email)
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          zone: user.zone,
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role as string
        token.zone = (user as any).zone as string
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role as string
        (session.user as any).zone = token.zone as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'mycollect-secret-key-2024',
}

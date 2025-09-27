import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import type { SessionStrategy } from "next-auth"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"

const prisma = new PrismaClient()

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email },
        })
        if (!admin) return null
        const valid = await bcrypt.compare(credentials.password, admin.passwordHash)
        if (!valid) return null
        return {
          id: admin.id,
          email: admin.email,
          role: admin.role,
          associationId: admin.associationId,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy, // <-- Type annotation added here
    maxAge: 60 * 60 * 24,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) { // <-- Type annotation added here
      if (user) {
        token.id = user.id
        token.role = user.role
        token.associationId = user.associationId
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) { // <-- Type annotation added here
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.associationId = token.associationId as string
      }
      return session
    },
  },
  pages: {
    signIn: "/admin/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
import type { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="w-full max-w-md p-8 rounded shadow bg-card">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to NACOS E-Voting</h1>
        {children}
      </div>
    </div>
  )
}
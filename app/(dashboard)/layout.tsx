"use client"

import React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { 
  Wallet, 
  LayoutDashboard, 
  Receipt, 
  BarChart3, 
  TrendingUp, 
  LogOut,
  Menu,
  X
} from "lucide-react"

interface Profile {
  display_name: string
  financial_personality: string
  current_balance: number
  investment_unlocked: boolean
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data } = await supabase
        .from("profiles")
        .select("display_name, financial_personality, current_balance, investment_unlocked")
        .eq("id", user.id)
        .single()

      if (data) {
        setProfile(data)
      }
      setLoading(false)
    }
    loadProfile()
  }, [router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push("/")
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: Receipt },
    { href: "/insights", label: "Insights", icon: BarChart3 },
    { href: "/investments", label: "Investments", icon: TrendingUp },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-card"
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 glass-card border-r border-border/30 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-4">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 py-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-purple">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xl font-bold gradient-text">FinSim</span>
          </div>

          {/* User info */}
          <div className="px-2 py-4 border-b border-border/30 mb-4">
            <p className="font-medium text-foreground">{profile?.display_name || "User"}</p>
            <p className="text-sm text-muted-foreground">{profile?.financial_personality}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary/20 text-primary glow-purple"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Balance card */}
          <div className="glass-card rounded-xl p-4 mb-4">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold gradient-text">
              ${(profile?.current_balance || 0).toLocaleString()}
            </p>
          </div>

          {/* Logout */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/30"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

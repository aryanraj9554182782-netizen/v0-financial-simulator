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
  X,
  Settings,
  User
} from "lucide-react"

const currencies: Record<string, string> = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  BTC: "₿",
  AED: "د.إ",
  SAR: "﷼",
}

interface Profile {
  display_name: string
  financial_personality: string
  current_balance: number
  investment_unlocked: boolean
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currencySymbol, setCurrencySymbol] = useState("$")
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    // Load saved currency
    const savedCurrency = localStorage.getItem("finsim_currency") || "USD"
    setCurrencySymbol(currencies[savedCurrency] || "$")

    // Listen for currency changes
    const handleCurrencyChange = (e: CustomEvent) => {
      setCurrencySymbol(currencies[e.detail] || "$")
    }
    window.addEventListener("currencyChange", handleCurrencyChange as EventListener)
    return () => window.removeEventListener("currencyChange", handleCurrencyChange as EventListener)
  }, [])

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
    { href: "/settings", label: "Settings", icon: Settings },
  ]

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
            <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-foreground" />
            </div>
            <span className="text-4xl font-bold text-white" style={{ textShadow: '0 0 20px rgba(192, 192, 192, 0.5), 0 0 40px rgba(192, 192, 192, 0.3)' }}>FinSim.</span>
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
                      ? "bg-foreground/10 text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 min-h-screen relative">
        {/* Profile icon - top right */}
        <div className="absolute top-4 right-4 lg:top-6 lg:right-8 z-50">
          <div className="relative">
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="w-10 h-10 rounded-full bg-foreground/10 border border-border/30 flex items-center justify-center hover:bg-foreground/20 transition-colors"
            >
              <User className="w-5 h-5 text-foreground" />
            </button>
            
            {profileMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setProfileMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl py-2 z-50 animate-fade-in bg-[#0c0c0c] border border-white/50">
                  <div className="px-4 py-2 border-b border-white/20">
                    <p className="font-medium text-foreground text-sm">{profile?.display_name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{profile?.financial_personality}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div 
          key={pathname}
          className="p-6 lg:p-8 animate-fade-in"
        >
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

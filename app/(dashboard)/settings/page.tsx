"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Settings, Check } from "lucide-react"

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "BTC", symbol: "₿", name: "Bitcoin" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
]

export default function SettingsPage() {
  const [currency, setCurrency] = useState("USD")
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Load saved currency from localStorage
    const savedCurrency = localStorage.getItem("finsim_currency")
    if (savedCurrency) {
      setCurrency(savedCurrency)
    }
  }, [])

  const handleCurrencyChange = (value: string) => {
    setCurrency(value)
    localStorage.setItem("finsim_currency", value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    
    // Dispatch custom event so other components can update
    window.dispatchEvent(new CustomEvent("currencyChange", { detail: value }))
  }

  const selectedCurrency = currencies.find(c => c.code === currency)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Customize your FinSim experience</p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6">
        {/* Currency Settings */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Currency</h2>
              <p className="text-sm text-muted-foreground">Choose your preferred currency symbol</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-[280px] bg-background/50 border-border/50">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      <span className="flex items-center gap-2">
                        <span className="w-6 text-center font-medium">{curr.symbol}</span>
                        <span>{curr.name}</span>
                        <span className="text-muted-foreground">({curr.code})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {saved && (
                <div className="flex items-center gap-2 text-green-500 animate-fade-in">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Saved!</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-background/30 border border-border/30">
              <p className="text-sm text-muted-foreground mb-2">Preview</p>
              <p className="text-2xl font-bold text-green-400">
                {selectedCurrency?.symbol}1,234,567.89
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

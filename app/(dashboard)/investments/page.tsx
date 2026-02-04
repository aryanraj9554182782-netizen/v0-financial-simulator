"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  DollarSign,
  PieChart,
  BarChart3,
  Info,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"

interface Investment {
  id: string
  symbol: string
  name: string
  type: string
  shares: number
  buy_price: number
  current_price: number
}

interface Profile {
  current_balance: number
  investment_unlocked: boolean
}

// Simulated stocks/funds with realistic behavior
const STOCKS = [
  { symbol: "TECH", name: "TechGrowth Inc.", type: "stock", price: 150.00, volatility: 0.03 },
  { symbol: "SAFE", name: "SafeBank Corp.", type: "stock", price: 45.00, volatility: 0.01 },
  { symbol: "GREEN", name: "EcoEnergy Ltd.", type: "stock", price: 78.50, volatility: 0.025 },
  { symbol: "GAME", name: "GameWorld Studios", type: "stock", price: 92.30, volatility: 0.04 },
  { symbol: "FOOD", name: "FreshFoods Co.", type: "stock", price: 34.20, volatility: 0.015 },
]

const FUNDS = [
  { symbol: "INDEX", name: "Total Market Index Fund", type: "fund", price: 100.00, volatility: 0.008 },
  { symbol: "GROWTH", name: "Growth Leaders Fund", type: "fund", price: 85.00, volatility: 0.012 },
  { symbol: "STABLE", name: "Stable Income Fund", type: "fund", price: 50.00, volatility: 0.005 },
]

// Generate realistic price history
function generatePriceHistory(basePrice: number, volatility: number, days: number = 30) {
  const history = []
  let price = basePrice * (1 - volatility * 5) // Start a bit lower
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    // Random walk with trend
    const change = (Math.random() - 0.48) * volatility * price // Slight upward bias
    price = Math.max(price * 0.8, price + change) // Floor at 80% of current
    
    history.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Number(price.toFixed(2))
    })
  }
  
  return history
}

export default function InvestmentsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAsset, setSelectedAsset] = useState<typeof STOCKS[0] | typeof FUNDS[0] | null>(null)
  const [priceHistory, setPriceHistory] = useState<{ date: string; price: number }[]>([])
  const [buyAmount, setBuyAmount] = useState("")
  const [buyDialogOpen, setBuyDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    const [profileRes, investmentsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("current_balance, investment_unlocked")
        .eq("id", user.id)
        .single(),
      supabase
        .from("investments")
        .select("*")
        .eq("user_id", user.id)
    ])

    if (profileRes.data) {
      setProfile(profileRes.data)
    }

    if (investmentsRes.data) {
      // Update current prices with simulated movement
      const updatedInvestments = investmentsRes.data.map(inv => {
        const asset = [...STOCKS, ...FUNDS].find(a => a.symbol === inv.symbol)
        if (asset) {
          const change = (Math.random() - 0.48) * asset.volatility * asset.price
          return { ...inv, current_price: Number((asset.price + change).toFixed(2)) }
        }
        return inv
      })
      setInvestments(updatedInvestments)
    }

    setLoading(false)
  }

  function selectAsset(asset: typeof STOCKS[0]) {
    setSelectedAsset(asset)
    setPriceHistory(generatePriceHistory(asset.price, asset.volatility))
  }

  async function handleBuy() {
    if (!selectedAsset || !profile || !buyAmount) return
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const shares = Number(buyAmount)
    const totalCost = shares * selectedAsset.price

    if (totalCost > profile.current_balance) {
      toast.error("Insufficient balance!")
      setSubmitting(false)
      return
    }

    // Check if already own this asset
    const existing = investments.find(i => i.symbol === selectedAsset.symbol)

    if (existing) {
      // Update existing position
      const newShares = existing.shares + shares
      const avgPrice = ((existing.shares * existing.buy_price) + totalCost) / newShares

      const { error } = await supabase
        .from("investments")
        .update({ 
          shares: newShares, 
          buy_price: avgPrice,
          current_price: selectedAsset.price 
        })
        .eq("id", existing.id)

      if (error) {
        toast.error("Failed to buy")
        setSubmitting(false)
        return
      }

      setInvestments(investments.map(i => 
        i.id === existing.id 
          ? { ...i, shares: newShares, buy_price: avgPrice, current_price: selectedAsset.price }
          : i
      ))
    } else {
      // Create new position
      const { data, error } = await supabase
        .from("investments")
        .insert({
          user_id: user.id,
          symbol: selectedAsset.symbol,
          name: selectedAsset.name,
          type: selectedAsset.type,
          shares: shares,
          buy_price: selectedAsset.price,
          current_price: selectedAsset.price,
        })
        .select()
        .single()

      if (error) {
        toast.error("Failed to buy")
        setSubmitting(false)
        return
      }

      setInvestments([...investments, data])
    }

    // Deduct from balance
    await supabase
      .from("profiles")
      .update({ current_balance: profile.current_balance - totalCost })
      .eq("id", user.id)

    setProfile({ ...profile, current_balance: profile.current_balance - totalCost })
    setBuyDialogOpen(false)
    setBuyAmount("")
    setSubmitting(false)
    toast.success(`Bought ${shares} shares of ${selectedAsset.symbol}!`)
  }

  async function handleSell(investment: Investment) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !profile) return

    const totalValue = investment.shares * investment.current_price

    // Delete the investment
    const { error } = await supabase
      .from("investments")
      .delete()
      .eq("id", investment.id)

    if (error) {
      toast.error("Failed to sell")
      return
    }

    // Add to balance
    await supabase
      .from("profiles")
      .update({ current_balance: profile.current_balance + totalValue })
      .eq("id", user.id)

    setProfile({ ...profile, current_balance: profile.current_balance + totalValue })
    setInvestments(investments.filter(i => i.id !== investment.id))
    
    const profit = totalValue - (investment.shares * investment.buy_price)
    if (profit >= 0) {
      toast.success(`Sold for $${totalValue.toFixed(2)} (+$${profit.toFixed(2)} profit!)`)
    } else {
      toast.info(`Sold for $${totalValue.toFixed(2)} ($${profit.toFixed(2)} loss)`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // Portfolio calculations
  const portfolioValue = investments.reduce((sum, i) => sum + (i.shares * i.current_price), 0)
  const totalCost = investments.reduce((sum, i) => sum + (i.shares * i.buy_price), 0)
  const totalProfit = portfolioValue - totalCost
  const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-8 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Investment Simulator</h1>
        <p className="text-muted-foreground mt-1">
          Learn to invest with simulated stocks and funds - no real money at risk!
        </p>
      </div>

      {/* Info Banner */}
      <div className="glass-card rounded-2xl p-4 flex items-start gap-3 border-primary/30">
        <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-muted-foreground">
          This is a simulation! Prices update randomly to mimic real market behavior. 
          Practice buying low and selling high to learn investment basics.
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Available Cash</p>
          <p className="text-2xl font-bold text-foreground">${profile?.current_balance.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Portfolio Value</p>
          <p className="text-2xl font-bold gradient-text">${portfolioValue.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Total Invested</p>
          <p className="text-2xl font-bold text-foreground">${totalCost.toFixed(2)}</p>
        </div>
        <div className="glass-card rounded-2xl p-5 space-y-1">
          <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
          <p className={`text-2xl font-bold flex items-center gap-1 ${totalProfit >= 0 ? 'text-green-500' : 'text-red-400'}`}>
            {totalProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            ${Math.abs(totalProfit).toFixed(2)} ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Market & Holdings */}
      <Tabs defaultValue="market" className="space-y-6">
        <TabsList className="glass-card p-1">
          <TabsTrigger value="market" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <BarChart3 className="w-4 h-4 mr-2" />
            Market
          </TabsTrigger>
          <TabsTrigger value="holdings" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            <PieChart className="w-4 h-4 mr-2" />
            My Holdings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="market" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Asset List */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                Stocks
              </h3>
              <div className="space-y-2">
                {STOCKS.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => selectAsset(stock)}
                    className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                      selectedAsset?.symbol === stock.symbol
                        ? "glass-card border-primary bg-primary/10"
                        : "glass hover:bg-muted/20"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{stock.symbol}</p>
                      <p className="text-sm text-muted-foreground">{stock.name}</p>
                    </div>
                    <p className="text-lg font-bold text-foreground">${stock.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>

              <h3 className="font-semibold text-foreground flex items-center gap-2 pt-4">
                <PieChart className="w-4 h-4 text-primary" />
                Index Funds
              </h3>
              <div className="space-y-2">
                {FUNDS.map((fund) => (
                  <button
                    key={fund.symbol}
                    onClick={() => selectAsset(fund)}
                    className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                      selectedAsset?.symbol === fund.symbol
                        ? "glass-card border-primary bg-primary/10"
                        : "glass hover:bg-muted/20"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{fund.symbol}</p>
                      <p className="text-sm text-muted-foreground">{fund.name}</p>
                    </div>
                    <p className="text-lg font-bold text-foreground">${fund.price.toFixed(2)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chart & Buy */}
            <div className="glass-card rounded-2xl p-6 space-y-4">
              {selectedAsset ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{selectedAsset.symbol}</h3>
                      <p className="text-sm text-muted-foreground">{selectedAsset.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold gradient-text">${selectedAsset.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground capitalize">{selectedAsset.type}</p>
                    </div>
                  </div>

                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100, 100, 150, 0.2)" />
                        <XAxis dataKey="date" stroke="#888" fontSize={10} />
                        <YAxis stroke="#888" fontSize={10} domain={['auto', 'auto']} />
                        <Tooltip 
                          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                          contentStyle={{ 
                            backgroundColor: 'rgba(15, 15, 30, 0.9)', 
                            border: '1px solid rgba(100, 100, 150, 0.3)',
                            borderRadius: '8px',
                            color: '#fff'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="price" 
                          stroke="url(#lineGradient)" 
                          strokeWidth={2}
                          dot={false}
                        />
                        <defs>
                          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#7c3aed" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-primary hover:bg-primary/90 glow-blue gap-2">
                        <DollarSign className="w-4 h-4" />
                        Buy {selectedAsset.symbol}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-border/30 text-foreground">
                      <DialogHeader>
                        <DialogTitle className="text-foreground">Buy {selectedAsset.symbol}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Number of Shares</Label>
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={buyAmount}
                            onChange={(e) => setBuyAmount(e.target.value)}
                            placeholder="Enter quantity"
                            className="bg-input border-border/50 text-foreground"
                          />
                        </div>
                        {buyAmount && (
                          <div className="p-4 rounded-xl bg-muted/20 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Price per share</span>
                              <span className="text-foreground">${selectedAsset.price.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Quantity</span>
                              <span className="text-foreground">{buyAmount}</span>
                            </div>
                            <div className="border-t border-border/30 pt-2 flex justify-between font-semibold">
                              <span className="text-foreground">Total Cost</span>
                              <span className="gradient-text">${(Number(buyAmount) * selectedAsset.price).toFixed(2)}</span>
                            </div>
                          </div>
                        )}
                        <Button 
                          onClick={handleBuy}
                          className="w-full bg-primary hover:bg-primary/90"
                          disabled={submitting || !buyAmount || Number(buyAmount) <= 0}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            "Confirm Purchase"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Select an asset to view details
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="holdings" className="space-y-4">
          {investments.length > 0 ? (
            <div className="space-y-3">
              {investments.map((inv) => {
                const currentValue = inv.shares * inv.current_price
                const costBasis = inv.shares * inv.buy_price
                const profit = currentValue - costBasis
                const profitPct = (profit / costBasis) * 100

                return (
                  <div key={inv.id} className="glass-card rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${inv.type === 'stock' ? 'bg-secondary/20' : 'bg-primary/20'}`}>
                        {inv.type === 'stock' ? (
                          <TrendingUp className="w-6 h-6 text-secondary" />
                        ) : (
                          <PieChart className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{inv.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {inv.shares} shares @ ${inv.buy_price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">${currentValue.toFixed(2)}</p>
                      <p className={`text-sm ${profit >= 0 ? 'text-green-500' : 'text-red-400'}`}>
                        {profit >= 0 ? '+' : ''}${profit.toFixed(2)} ({profitPct >= 0 ? '+' : ''}{profitPct.toFixed(1)}%)
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSell(inv)}
                      className="ml-4 bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      Sell All
                    </Button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 text-center">
              <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">{"You don't have any investments yet."}</p>
              <p className="text-sm text-muted-foreground mt-1">Go to Market tab to buy your first asset!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

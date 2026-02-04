"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
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
  CartesianGrid,
  Area,
  AreaChart
} from "recharts"
import { 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  DollarSign,
  PieChart,
  BarChart3,
  Info,
  Sparkles,
  Lightbulb,
  Shield,
  Zap,
  BookOpen,
  ChevronRight,
  HelpCircle,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle2,
  GraduationCap
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

// Simulated stocks/funds with beginner-friendly descriptions
const STOCKS = [
  { 
    symbol: "TECH", 
    name: "TechGrowth Inc.", 
    type: "stock", 
    price: 150.00, 
    volatility: 0.03,
    risk: "High",
    description: "A fast-growing tech company. Higher risk, but potential for bigger gains!",
    icon: Zap,
    color: "text-blue-400"
  },
  { 
    symbol: "SAFE", 
    name: "SafeBank Corp.", 
    type: "stock", 
    price: 45.00, 
    volatility: 0.01,
    risk: "Low",
    description: "A stable banking company. Slower growth, but more reliable.",
    icon: Shield,
    color: "text-emerald-400"
  },
  { 
    symbol: "GREEN", 
    name: "EcoEnergy Ltd.", 
    type: "stock", 
    price: 78.50, 
    volatility: 0.025,
    risk: "Medium",
    description: "Clean energy company. Good for long-term growth as world goes green!",
    icon: Sparkles,
    color: "text-green-400"
  },
  { 
    symbol: "GAME", 
    name: "GameWorld Studios", 
    type: "stock", 
    price: 92.30, 
    volatility: 0.04,
    risk: "High",
    description: "Video game company. Can be volatile but exciting to follow!",
    icon: Target,
    color: "text-pink-400"
  },
  { 
    symbol: "FOOD", 
    name: "FreshFoods Co.", 
    type: "stock", 
    price: 34.20, 
    volatility: 0.015,
    risk: "Low",
    description: "Food & grocery company. People always need to eat, so pretty stable!",
    icon: CheckCircle2,
    color: "text-orange-400"
  },
]

const FUNDS = [
  { 
    symbol: "INDEX", 
    name: "Total Market Index Fund", 
    type: "fund", 
    price: 100.00, 
    volatility: 0.008,
    risk: "Low",
    description: "Invests in EVERYTHING! Like buying a tiny piece of the whole market. Great for beginners!",
    icon: PieChart,
    color: "text-primary"
  },
  { 
    symbol: "GROWTH", 
    name: "Growth Leaders Fund", 
    type: "fund", 
    price: 85.00, 
    volatility: 0.012,
    risk: "Medium",
    description: "Invests in companies expected to grow fast. More risk, more potential reward.",
    icon: TrendingUp,
    color: "text-secondary"
  },
  { 
    symbol: "STABLE", 
    name: "Stable Income Fund", 
    type: "fund", 
    price: 50.00, 
    volatility: 0.005,
    risk: "Very Low",
    description: "Super safe investments. Grows slowly but steadily. Perfect for saving!",
    icon: Shield,
    color: "text-emerald-400"
  },
]

// Educational tips for beginners
const LEARNING_TIPS = [
  {
    title: "What is a Stock?",
    content: "When you buy a stock, you own a tiny piece of a company! If the company does well, your piece becomes more valuable.",
    icon: Lightbulb
  },
  {
    title: "What is an Index Fund?",
    content: "Instead of picking one company, index funds spread your money across many companies. It's like not putting all your eggs in one basket!",
    icon: PieChart
  },
  {
    title: "Buy Low, Sell High",
    content: "The classic investing rule: try to buy when prices are low and sell when they're higher. But timing the market is really hard!",
    icon: TrendingUp
  },
  {
    title: "Time in the Market",
    content: "Historically, staying invested for a long time beats trying to time perfect moments. Patience pays off!",
    icon: Clock
  }
]

// Generate realistic price history
function generatePriceHistory(basePrice: number, volatility: number, days: number = 30) {
  const history = []
  let price = basePrice * (1 - volatility * 5)
  
  for (let i = days; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const change = (Math.random() - 0.48) * volatility * price
    price = Math.max(price * 0.8, price + change)
    
    history.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: Number(price.toFixed(2))
    })
  }
  
  return history
}

function RiskBadge({ risk }: { risk: string }) {
  const colors: Record<string, string> = {
    "Very Low": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Low": "bg-green-500/20 text-green-400 border-green-500/30",
    "Medium": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "High": "bg-red-500/20 text-red-400 border-red-500/30",
  }
  
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${colors[risk] || colors["Medium"]}`}>
      {risk} Risk
    </span>
  )
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
  const [showLearnModal, setShowLearnModal] = useState(false)
  const [activeTip, setActiveTip] = useState(0)
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

    const existing = investments.find(i => i.symbol === selectedAsset.symbol)

    if (existing) {
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

    await supabase
      .from("profiles")
      .update({ current_balance: profile.current_balance - totalCost })
      .eq("id", user.id)

    setProfile({ ...profile, current_balance: profile.current_balance - totalCost })
    setBuyDialogOpen(false)
    setBuyAmount("")
    setSubmitting(false)
    toast.success(`You now own ${shares} shares of ${selectedAsset.symbol}!`)
  }

  async function handleSell(investment: Investment) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !profile) return

    const totalValue = investment.shares * investment.current_price

    const { error } = await supabase
      .from("investments")
      .delete()
      .eq("id", investment.id)

    if (error) {
      toast.error("Failed to sell")
      return
    }

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

  const portfolioValue = investments.reduce((sum, i) => sum + (i.shares * i.current_price), 0)
  const totalCost = investments.reduce((sum, i) => sum + (i.shares * i.buy_price), 0)
  const totalProfit = portfolioValue - totalCost
  const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-8 lg:pt-0 pb-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            Learn to Invest
            <span className="text-sm font-normal bg-primary/20 text-primary px-3 py-1 rounded-full">
              Simulation Mode
            </span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Practice investing with fake money - no real risk!
          </p>
        </div>
        <Dialog open={showLearnModal} onOpenChange={setShowLearnModal}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10 bg-transparent">
              <GraduationCap className="w-4 h-4" />
              Learn the Basics
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Investing 101
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              {LEARNING_TIPS.map((tip, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTip(idx)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${
                    activeTip === idx 
                      ? "bg-primary/20 border border-primary/30" 
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${activeTip === idx ? "bg-primary/30" : "bg-muted"}`}>
                      <tip.icon className={`w-4 h-4 ${activeTip === idx ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <span className="font-medium">{tip.title}</span>
                  </div>
                  {activeTip === idx && (
                    <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                      {tip.content}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Quick Tip Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 rounded-2xl p-5 border border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-primary/20 rounded-xl shrink-0">
            <Lightbulb className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Quick Tip: Start with Index Funds!</p>
            <p className="text-sm text-muted-foreground mt-1">
              New to investing? Index funds are a great way to start because they spread your money across many companies automatically. Less risky than picking individual stocks!
            </p>
          </div>
        </div>
      </div>

      {/* Your Money Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Your Cash</p>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">${profile?.current_balance.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Available to invest</p>
        </div>
        
        <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Invested</p>
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">${portfolioValue.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Current portfolio value</p>
        </div>
        
        <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">${totalCost.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Original investment</p>
        </div>
        
        <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Profit/Loss</p>
            {totalProfit >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
          <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
            {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">
            {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}% overall
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList className="bg-muted/30 p-1 gap-1">
          <TabsTrigger 
            value="browse" 
            className="data-[state=active]:bg-background data-[state=active]:text-foreground gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Browse Investments
          </TabsTrigger>
          <TabsTrigger 
            value="portfolio" 
            className="data-[state=active]:bg-background data-[state=active]:text-foreground gap-2"
          >
            <PieChart className="w-4 h-4" />
            My Portfolio ({investments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Beginner Recommended Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-foreground">Recommended for Beginners</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                Lower Risk
              </span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {FUNDS.map((fund) => {
                const Icon = fund.icon
                return (
                  <button
                    key={fund.symbol}
                    onClick={() => selectAsset(fund)}
                    className={`text-left p-5 rounded-2xl border transition-all hover:scale-[1.02] ${
                      selectedAsset?.symbol === fund.symbol
                        ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                        : "bg-card border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${selectedAsset?.symbol === fund.symbol ? "bg-primary/20" : "bg-muted/50"}`}>
                        <Icon className={`w-5 h-5 ${fund.color}`} />
                      </div>
                      <RiskBadge risk={fund.risk} />
                    </div>
                    <p className="font-bold text-lg text-foreground">{fund.symbol}</p>
                    <p className="text-sm text-muted-foreground mb-2">{fund.name}</p>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{fund.description}</p>
                    <p className="text-xl font-bold text-primary">${fund.price.toFixed(2)}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Individual Stocks */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Individual Stocks</h3>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                More Risk
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {STOCKS.map((stock) => {
                const Icon = stock.icon
                return (
                  <button
                    key={stock.symbol}
                    onClick={() => selectAsset(stock)}
                    className={`text-left p-5 rounded-2xl border transition-all hover:scale-[1.02] ${
                      selectedAsset?.symbol === stock.symbol
                        ? "bg-primary/10 border-primary shadow-lg shadow-primary/10"
                        : "bg-card border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${selectedAsset?.symbol === stock.symbol ? "bg-primary/20" : "bg-muted/50"}`}>
                        <Icon className={`w-5 h-5 ${stock.color}`} />
                      </div>
                      <RiskBadge risk={stock.risk} />
                    </div>
                    <p className="font-bold text-lg text-foreground">{stock.symbol}</p>
                    <p className="text-sm text-muted-foreground mb-2">{stock.name}</p>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{stock.description}</p>
                    <p className="text-xl font-bold text-foreground">${stock.price.toFixed(2)}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected Asset Detail */}
          {selectedAsset && (
            <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-xl">
                    <selectedAsset.icon className={`w-6 h-6 ${selectedAsset.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold text-foreground">{selectedAsset.symbol}</h3>
                      <RiskBadge risk={selectedAsset.risk} />
                    </div>
                    <p className="text-muted-foreground">{selectedAsset.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">${selectedAsset.price.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">per share</p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-sm text-muted-foreground">{selectedAsset.description}</p>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={11} 
                      domain={['auto', 'auto']}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <p className="text-sm text-blue-300">
                  This chart shows the last 30 days. Remember: past performance doesn't guarantee future results!
                </p>
              </div>

              <Dialog open={buyDialogOpen} onOpenChange={setBuyDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full h-12 text-base gap-2" size="lg">
                    <DollarSign className="w-5 h-5" />
                    Buy {selectedAsset.symbol}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      Buy {selectedAsset.symbol}
                      <RiskBadge risk={selectedAsset.risk} />
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-5 mt-4">
                    <div className="space-y-2">
                      <Label>How many shares?</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                        placeholder="Enter number of shares"
                        className="h-12 text-lg"
                      />
                      <p className="text-xs text-muted-foreground">
                        You have ${profile?.current_balance.toLocaleString()} available
                      </p>
                    </div>
                    
                    {buyAmount && Number(buyAmount) > 0 && (
                      <div className="p-4 rounded-xl bg-muted/30 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Price per share</span>
                          <span className="font-medium">${selectedAsset.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Number of shares</span>
                          <span className="font-medium">{buyAmount}</span>
                        </div>
                        <div className="border-t border-border pt-3 flex justify-between">
                          <span className="font-semibold">Total Cost</span>
                          <span className="font-bold text-primary text-lg">
                            ${(Number(buyAmount) * selectedAsset.price).toFixed(2)}
                          </span>
                        </div>
                        {Number(buyAmount) * selectedAsset.price > (profile?.current_balance || 0) && (
                          <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            Not enough cash for this purchase
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      onClick={handleBuy}
                      className="w-full h-12"
                      disabled={
                        submitting || 
                        !buyAmount || 
                        Number(buyAmount) <= 0 ||
                        Number(buyAmount) * selectedAsset.price > (profile?.current_balance || 0)
                      }
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
            </div>
          )}
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          {investments.length > 0 ? (
            <>
              <div className="p-4 bg-muted/30 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <p className="text-sm text-muted-foreground">
                  You own {investments.length} investment{investments.length > 1 ? 's' : ''}. Click sell to convert back to cash.
                </p>
              </div>
              <div className="space-y-3">
                {investments.map((inv) => {
                  const currentValue = inv.shares * inv.current_price
                  const costBasis = inv.shares * inv.buy_price
                  const profit = currentValue - costBasis
                  const profitPct = (profit / costBasis) * 100
                  const asset = [...STOCKS, ...FUNDS].find(a => a.symbol === inv.symbol)
                  const Icon = asset?.icon || Target

                  return (
                    <div key={inv.id} className="bg-card border border-border/50 rounded-2xl p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-muted/50 rounded-xl">
                            <Icon className={`w-5 h-5 ${asset?.color || 'text-primary'}`} />
                          </div>
                          <div>
                            <p className="font-bold text-lg text-foreground">{inv.symbol}</p>
                            <p className="text-sm text-muted-foreground">{inv.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {inv.shares} shares @ ${inv.buy_price.toFixed(2)} avg
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xl font-bold text-foreground">${currentValue.toFixed(2)}</p>
                            <p className={`text-sm font-medium flex items-center justify-end gap-1 ${
                              profit >= 0 ? 'text-emerald-500' : 'text-red-400'
                            }`}>
                              {profit >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {profit >= 0 ? '+' : ''}${profit.toFixed(2)} ({profitPct >= 0 ? '+' : ''}{profitPct.toFixed(1)}%)
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => handleSell(inv)}
                            className="shrink-0"
                          >
                            Sell All
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto">
                <PieChart className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">No investments yet</p>
                <p className="text-muted-foreground mt-1">
                  Start by buying your first stock or fund from the Browse tab!
                </p>
              </div>
              <Button 
                variant="outline" 
                className="mt-4 bg-transparent"
                onClick={() => {
                  const tabsList = document.querySelector('[role="tablist"]')
                  const browseTab = tabsList?.querySelector('[value="browse"]') as HTMLButtonElement
                  browseTab?.click()
                }}
              >
                Browse Investments
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { toast } from "sonner"

interface Profile {
  id: string
  display_name: string
  financial_personality: string
  monthly_income: number
  savings_goal: number
  current_balance: number
  total_savings: number
  investment_unlocked: boolean
}

interface Transaction {
  id: string
  description: string
  amount: number
  type: string
  date: string
  categories: { name: string; color: string } | null
}

interface Challenge {
  id: string
  scenario: string
  choice_made: string | null
  is_good_choice: boolean | null
  insight: string | null
  date: string
}

const DAILY_SCENARIOS = [
  {
    scenario: "Your favorite game just went on sale for $20. Your friend says you should buy it now. What do you do?",
    choices: [
      { label: "Buy it immediately", value: "buy", isGood: false },
      { label: "Wait and think about it for a day", value: "wait", isGood: true },
      { label: "Check if you've budgeted for it", value: "budget", isGood: true },
    ],
    insights: {
      buy: "Impulse buying can quickly drain your savings. Try the 24-hour rule next time!",
      wait: "Great choice! The 24-hour rule helps you make better spending decisions.",
      budget: "Smart thinking! Checking your budget first shows excellent financial awareness.",
    },
  },
  {
    scenario: "You receive $50 as a birthday gift. How do you handle it?",
    choices: [
      { label: "Spend it all on something fun", value: "spend", isGood: false },
      { label: "Save half, spend half", value: "split", isGood: true },
      { label: "Save all of it", value: "save", isGood: true },
    ],
    insights: {
      spend: "While it's okay to treat yourself, consider saving at least a portion of gifts.",
      split: "The 50/50 rule is a balanced approach to handling unexpected money!",
      save: "Excellent discipline! Saving unexpected money accelerates your financial goals.",
    },
  },
  {
    scenario: "Your phone screen cracked slightly but still works. A new phone costs $300. What's your move?",
    choices: [
      { label: "Buy a new phone right away", value: "new", isGood: false },
      { label: "Get the screen repaired for $50", value: "repair", isGood: true },
      { label: "Use it as is and save for later", value: "wait", isGood: true },
    ],
    insights: {
      new: "Consider if you really need a new phone or if a repair would work just fine.",
      repair: "Smart choice! Repairs are often much cheaper than replacements.",
      wait: "Great patience! Using what you have while saving is financially wise.",
    },
  },
  {
    scenario: "Your friends want to eat out, but you've already spent your entertainment budget this month.",
    choices: [
      { label: "Go anyway, it's just once", value: "go", isGood: false },
      { label: "Suggest a cheaper alternative", value: "alternative", isGood: true },
      { label: "Be honest and skip this one", value: "skip", isGood: true },
    ],
    insights: {
      go: "Peer pressure can hurt your budget. It's okay to say no sometimes.",
      alternative: "Proposing alternatives shows leadership and financial awareness!",
      skip: "Sticking to your budget takes courage. Your future self will thank you!",
    },
  },
  {
    scenario: "You found a $10 bill on the ground at school with no one around.",
    choices: [
      { label: "Keep it and spend it", value: "keep", isGood: false },
      { label: "Turn it in to lost and found", value: "lost", isGood: true },
      { label: "Keep it but donate to charity", value: "donate", isGood: true },
    ],
    insights: {
      keep: "Consider the golden rule - how would you feel if you lost $10?",
      lost: "Honesty is always the best policy! Good character leads to good finances.",
      donate: "Turning something uncertain into something good shows great character!",
    },
  },
]

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [todayChallenge, setTodayChallenge] = useState<Challenge | null>(null)
  const [currentScenario, setCurrentScenario] = useState<typeof DAILY_SCENARIOS[0] | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load profile
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.log("[v0] Profile not found, redirecting to onboarding")
      // Profile doesn't exist, redirect to onboarding
      window.location.href = "/onboarding"
      return
    }

    if (profileData) {
      setProfile(profileData)
    }

    // Load recent transactions
    const { data: transactionsData } = await supabase
      .from("transactions")
      .select("*, categories(name, color)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    if (transactionsData) {
      setTransactions(transactionsData)
    }

    // Load today's challenge
    const today = new Date().toISOString().split('T')[0]
    const { data: challengeData } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", today)
      .single()

    if (challengeData) {
      setTodayChallenge(challengeData)
    } else {
      // Pick a random scenario for today
      const randomScenario = DAILY_SCENARIOS[Math.floor(Math.random() * DAILY_SCENARIOS.length)]
      setCurrentScenario(randomScenario)
    }

    setLoading(false)
  }

  async function handleChallengeChoice(choice: { value: string; isGood: boolean }) {
    if (!currentScenario || !profile) return
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const insight = currentScenario.insights[choice.value as keyof typeof currentScenario.insights]

    const { data, error } = await supabase
      .from("daily_challenges")
      .insert({
        user_id: user.id,
        scenario: currentScenario.scenario,
        choice_made: choice.value,
        is_good_choice: choice.isGood,
        insight: insight,
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to save your choice")
      setSubmitting(false)
      return
    }

    // Update balance based on choice
    const balanceChange = choice.isGood ? 10 : -5
    const newBalance = (profile.current_balance || 0) + balanceChange
    const newSavings = (profile.total_savings || 0) + (choice.isGood ? 10 : 0)

    // Check if should unlock investments
    const shouldUnlockInvestments = newSavings >= 500 && !profile.investment_unlocked

    await supabase
      .from("profiles")
      .update({ 
        current_balance: newBalance,
        total_savings: newSavings,
        investment_unlocked: shouldUnlockInvestments || profile.investment_unlocked,
      })
      .eq("id", user.id)

    if (shouldUnlockInvestments) {
      toast.success("Congratulations! You've unlocked the Investment Simulator!")
    }

    setTodayChallenge(data)
    setCurrentScenario(null)
    setProfile({ ...profile, current_balance: newBalance, total_savings: newSavings })
    setSubmitting(false)

    if (choice.isGood) {
      toast.success(`+$10 added to your balance!`)
    } else {
      toast.info(`-$5 from your balance. Learn from it!`)
    }
  }

  const savingsProgress = profile?.savings_goal 
    ? Math.min(100, ((profile.total_savings || 0) / profile.savings_goal) * 100)
    : 0

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-8 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome back, {profile?.display_name?.split(' ')[0]}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {"Here's your financial overview for today"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Current Balance</p>
          <p className={`text-3xl font-bold ${(profile?.current_balance || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${(profile?.current_balance || 0).toLocaleString()}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Total Savings</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-foreground">
              ${(profile?.total_savings || 0).toLocaleString()}
            </p>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Monthly Goal</p>
          <p className="text-3xl font-bold text-foreground">
            ${(profile?.savings_goal || 0).toLocaleString()}
          </p>
          <Progress value={savingsProgress} className="h-2 bg-muted" />
        </div>
      </div>

      {/* Daily Challenge */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h2 className="text-xl font-bold text-foreground">Daily Challenge</h2>
        </div>

        {todayChallenge ? (
          <div className="space-y-4">
            <p className="text-muted-foreground">{todayChallenge.scenario}</p>
            <div className={`flex items-start gap-3 p-4 rounded-xl ${todayChallenge.is_good_choice ? 'bg-green-500/10 border border-green-500/20' : 'bg-orange-500/10 border border-orange-500/20'}`}>
              {todayChallenge.is_good_choice ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {todayChallenge.is_good_choice ? "Great choice!" : "Learning moment!"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{todayChallenge.insight}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Come back tomorrow for a new challenge!
            </p>
          </div>
        ) : currentScenario ? (
          <div className="space-y-4">
            <p className="text-foreground text-lg">{currentScenario.scenario}</p>
            <div className="grid gap-3">
              {currentScenario.choices.map((choice) => (
                <Button
                  key={choice.value}
                  variant="outline"
                  onClick={() => handleChallengeChoice(choice)}
                  disabled={submitting}
                  className="justify-start text-left h-auto py-4 px-4 bg-transparent border-border/50 hover:bg-muted/30 hover:border-foreground/30 text-foreground hover:text-foreground"
                >
                  {choice.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No challenge available right now. Check back later!
          </p>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Recent Transactions</h2>
          <a href="/transactions" className="text-primary hover:underline text-sm flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${tx.categories?.color || '#6b7280'}20` }}
                  >
                    {tx.type === "income" ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tx.description}</p>
                    <p className="text-sm text-muted-foreground">{tx.categories?.name || "Uncategorized"}</p>
                  </div>
                </div>
                <p className={`font-semibold ${tx.type === "income" ? "text-green-500" : "text-red-400"}`}>
                  {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No transactions yet. Start tracking your spending!
          </p>
        )}
      </div>
    </div>
  )
}

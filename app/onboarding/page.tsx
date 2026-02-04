"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import { toast } from "sonner"

const QUESTIONS = [
  {
    id: 1,
    question: "How much is your monthly income/pocket money?",
    type: "input",
    inputType: "number",
    placeholder: "Enter amount in $",
    field: "monthly_income",
  },
  {
    id: 2,
    question: "What's your main savings goal?",
    type: "options",
    options: [
      { value: "phone", label: "New Phone/Gadget" },
      { value: "education", label: "Education/Courses" },
      { value: "travel", label: "Travel/Experiences" },
      { value: "emergency", label: "Emergency Fund" },
      { value: "investment", label: "Start Investing" },
      { value: "other", label: "Other" },
    ],
    field: "goal_type",
  },
  {
    id: 3,
    question: "How much do you want to save each month?",
    type: "input",
    inputType: "number",
    placeholder: "Enter your savings target in $",
    field: "savings_goal",
  },
  {
    id: 4,
    question: "When you get money, what do you usually do first?",
    type: "options",
    options: [
      { value: "save_first", label: "Save some immediately" },
      { value: "budget", label: "Plan how to spend it" },
      { value: "spend", label: "Spend on something I want" },
      { value: "mixed", label: "Depends on my mood" },
    ],
    field: "spending_habit",
  },
  {
    id: 5,
    question: "How do you feel about tracking your expenses?",
    type: "options",
    options: [
      { value: "love_it", label: "I love tracking everything!" },
      { value: "sometimes", label: "I do it sometimes" },
      { value: "want_to", label: "I want to start" },
      { value: "not_interested", label: "Not really my thing" },
    ],
    field: "tracking_attitude",
  },
]

const PERSONALITIES = {
  "The Saver": {
    description: "You're naturally inclined to save! You think before you spend and always have a cushion for emergencies.",
    color: "primary",
    tips: "Keep up the great work! Consider learning about investments to make your money grow.",
  },
  "The Planner": {
    description: "You love having a plan! Budgets and tracking come naturally to you.",
    color: "secondary",
    tips: "Your planning skills are valuable. Try setting stretch goals to challenge yourself!",
  },
  "The Explorer": {
    description: "You're learning and growing! Every financial decision is a chance to improve.",
    color: "accent",
    tips: "Start with small habits - track one expense category this week!",
  },
  "The Spontaneous": {
    description: "You live in the moment! Learning to balance spontaneity with planning will serve you well.",
    color: "secondary",
    tips: "Try the 24-hour rule: wait a day before making non-essential purchases.",
  },
}

function calculatePersonality(answers: Record<string, string>): keyof typeof PERSONALITIES {
  let saveScore = 0
  let planScore = 0

  if (answers.spending_habit === "save_first") saveScore += 2
  if (answers.spending_habit === "budget") planScore += 2
  if (answers.spending_habit === "spend") saveScore -= 1
  
  if (answers.tracking_attitude === "love_it") planScore += 2
  if (answers.tracking_attitude === "sometimes") planScore += 1
  if (answers.tracking_attitude === "want_to") planScore += 0.5

  const totalIncome = Number(answers.monthly_income) || 0
  const savingsGoal = Number(answers.savings_goal) || 0
  if (totalIncome > 0 && savingsGoal / totalIncome >= 0.2) saveScore += 1

  if (saveScore >= 2 && planScore >= 2) return "The Saver"
  if (planScore >= 2) return "The Planner"
  if (saveScore >= 1 || planScore >= 1) return "The Explorer"
  return "The Spontaneous"
}

export default function OnboardingPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResult, setShowResult] = useState(false)
  const [personality, setPersonality] = useState<keyof typeof PERSONALITIES | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      
      // Check if already completed quiz
      const { data: profile } = await supabase
        .from("profiles")
        .select("quiz_completed")
        .eq("id", user.id)
        .single()

      if (profile?.quiz_completed) {
        router.push("/dashboard")
        return
      }
      
      setCheckingAuth(false)
    }
    checkUser()
  }, [router, supabase])

  const question = QUESTIONS[currentQuestion]
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100

  function handleAnswer(value: string) {
    setAnswers({ ...answers, [question.field]: value })
  }

  function handleNext() {
    if (!answers[question.field]) {
      toast.error("Please answer the question before continuing")
      return
    }

    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      // Calculate personality and show result
      const result = calculatePersonality(answers)
      setPersonality(result)
      setShowResult(true)
    }
  }

  function handleBack() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  async function handleFinish() {
    if (!personality) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error("Please log in again")
      router.push("/auth/login")
      return
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        financial_personality: personality,
        monthly_income: Number(answers.monthly_income) || 0,
        savings_goal: Number(answers.savings_goal) || 0,
        current_balance: Number(answers.monthly_income) || 1000,
        total_savings: 0,
        quiz_completed: true,
        investment_unlocked: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (error) {
      toast.error("Failed to save your profile")
      console.error(error)
      setLoading(false)
      return
    }

    // Create default categories
    const defaultCategories = [
      { name: "Food & Drinks", icon: "utensils", color: "#f97316", user_id: user.id },
      { name: "Entertainment", icon: "gamepad", color: "#8b5cf6", user_id: user.id },
      { name: "Shopping", icon: "shopping-bag", color: "#ec4899", user_id: user.id },
      { name: "Transport", icon: "car", color: "#3b82f6", user_id: user.id },
      { name: "Education", icon: "book", color: "#10b981", user_id: user.id },
      { name: "Other", icon: "circle", color: "#6b7280", user_id: user.id },
    ]

    await supabase.from("categories").insert(defaultCategories)

    // Add initial income as first transaction
    const monthlyIncome = Number(answers.monthly_income) || 0
    if (monthlyIncome > 0) {
      await supabase.from("transactions").insert({
        user_id: user.id,
        description: "Monthly Income/Pocket Money",
        amount: monthlyIncome,
        type: "income",
        date: new Date().toISOString().split('T')[0],
      })
    }

    toast.success("Profile created successfully!")
    router.push("/dashboard")
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (showResult && personality) {
    const personalityData = PERSONALITIES[personality]
    
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 w-full max-w-lg">
          <div className="glass-card rounded-2xl p-8 space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto glow-blue animate-float">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground">Your Financial Personality is...</p>
              <h1 className="text-4xl font-bold gradient-text">{personality}</h1>
            </div>

            <p className="text-muted-foreground">{personalityData.description}</p>

            <div className="glass-card rounded-xl p-4 text-left">
              <p className="text-sm font-medium text-foreground mb-1">Pro Tip:</p>
              <p className="text-sm text-muted-foreground">{personalityData.tips}</p>
            </div>

            <Button 
              onClick={handleFinish}
              className="w-full bg-primary hover:bg-primary/90 glow-blue gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Setting up your dashboard...
                </>
              ) : (
                <>
                  Start Your Journey
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-6">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="glass-card rounded-2xl p-8 space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Question {currentQuestion + 1} of {QUESTIONS.length}</span>
              <span className="text-primary font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-muted" />
          </div>

          {/* Question */}
          <div className="space-y-6 py-4">
            <h2 className="text-2xl font-bold text-foreground text-balance">{question.question}</h2>

            {question.type === "input" ? (
              <div className="space-y-2">
                <Label htmlFor="answer" className="sr-only">{question.question}</Label>
                <Input
                  id="answer"
                  type={question.inputType}
                  placeholder={question.placeholder}
                  value={answers[question.field] || ""}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="bg-input border-border/50 focus:border-primary text-foreground text-lg py-6 placeholder:text-muted-foreground"
                />
              </div>
            ) : (
              <div className="grid gap-3 relative z-20">
                {question.options?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 rounded-xl text-left transition-all cursor-pointer relative z-20 ${
                      answers[question.field] === option.value
                        ? "bg-primary/20 border-2 border-primary text-foreground"
                        : "bg-muted/30 border border-border/50 hover:border-primary/50 hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            {currentQuestion > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="gap-2 bg-transparent border-border/50 hover:bg-muted/30 text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button 
              onClick={handleNext}
              className="flex-1 bg-primary hover:bg-primary/90 glow-blue gap-2"
            >
              {currentQuestion === QUESTIONS.length - 1 ? "See Results" : "Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

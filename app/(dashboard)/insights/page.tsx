"use client"

import React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Progress } from "@/components/ui/progress"
import { 
  Loader2,
  Sparkles,
  Leaf,
  TreeDeciduous,
  Apple,
  Bug,
  Droplets,
  Sun,
  Wind,
  Heart
} from "lucide-react"

interface Profile {
  monthly_income: number
  savings_goal: number
  current_balance: number
  total_savings: number
  financial_personality: string
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
  is_good_choice: boolean
  date: string
}

// Tree SVG Component with Dynamic Animations
function FinancialTree({ 
  rootsHealth, 
  trunkHealth, 
  growthLevel, 
  fruitsCount, 
  pestsCount 
}: { 
  rootsHealth: number
  trunkHealth: number
  growthLevel: number
  fruitsCount: number
  pestsCount: number
}) {
  const treeColor = trunkHealth > 70 ? "#22c55e" : trunkHealth > 40 ? "#eab308" : "#f97316"
  const leafColor = growthLevel > 70 ? "#22c55e" : growthLevel > 40 ? "#84cc16" : "#a3a3a3"
  const rootColor = rootsHealth > 70 ? "#8b5cf6" : rootsHealth > 40 ? "#c084fc" : "#6b7280"
  
  return (
    <div className="relative w-full h-[450px] flex items-center justify-center overflow-visible">
      <svg viewBox="0 0 400 400" className="w-full h-full max-w-[450px]" style={{ overflow: 'visible' }}>
        <defs>
          {/* Gradients */}
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={treeColor} stopOpacity="0.8" />
            <stop offset="50%" stopColor={treeColor} stopOpacity="1" />
            <stop offset="100%" stopColor={treeColor} stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={leafColor} stopOpacity="1" />
            <stop offset="100%" stopColor={leafColor} stopOpacity="0.7" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Animated Sun with rays */}
        <g className="animate-sun">
          <circle cx="380" cy="50" r="80" fill="url(#sunGlow)">
            <animate attributeName="r" values="70;85;70" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="380" cy="50" r="22" fill="#fbbf24" filter="url(#glow)">
            <animate attributeName="r" values="20;24;20" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Sun rays */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line
              key={angle}
              x1={380 + Math.cos(angle * Math.PI / 180) * 30}
              y1={50 + Math.sin(angle * Math.PI / 180) * 30}
              x2={380 + Math.cos(angle * Math.PI / 180) * 45}
              y2={50 + Math.sin(angle * Math.PI / 180) * 45}
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            >
              <animate attributeName="opacity" values="0.3;0.8;0.3" dur={`${2 + i * 0.2}s`} repeatCount="indefinite" />
            </line>
          ))}
        </g>
        
        {/* Ground with shimmer */}
        <ellipse cx="200" cy="345" rx="160" ry="25" fill="rgba(139, 92, 246, 0.15)">
          <animate attributeName="rx" values="155;165;155" dur="5s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="200" cy="340" rx="140" ry="18" fill="rgba(139, 92, 246, 0.25)" />
        
        {/* Roots - Money Habits (animated pulse) */}
        <g>
          {[
            { d: "M200 340 Q150 370 90 385", w: 9, o: 0.9 },
            { d: "M200 340 Q175 385 130 400", w: 6, o: 0.7 },
            { d: "M200 340 Q250 370 310 385", w: 9, o: 0.9 },
            { d: "M200 340 Q225 385 270 400", w: 6, o: 0.7 },
            { d: "M200 340 Q200 385 200 400", w: 5, o: 0.6 },
            { d: "M200 340 Q160 355 120 360", w: 4, o: 0.5 },
            { d: "M200 340 Q240 355 280 360", w: 4, o: 0.5 },
          ].map((root, i) => (
            <path 
              key={i}
              d={root.d}
              stroke={rootColor} 
              strokeWidth={root.w}
              fill="none" 
              strokeLinecap="round"
              opacity={root.o}
              filter="url(#softGlow)"
            >
              <animate 
                attributeName="stroke-width" 
                values={`${root.w};${root.w + 2};${root.w}`} 
                dur={`${2 + i * 0.3}s`} 
                repeatCount="indefinite" 
              />
              <animate 
                attributeName="opacity" 
                values={`${root.o};${Math.min(1, root.o + 0.2)};${root.o}`} 
                dur={`${2.5 + i * 0.2}s`} 
                repeatCount="indefinite" 
              />
            </path>
          ))}
          {/* Root glow particles */}
          {rootsHealth > 50 && [1,2,3].map((_, i) => (
            <circle key={i} r="3" fill={rootColor} opacity="0.6">
              <animateMotion 
                dur={`${3 + i}s`} 
                repeatCount="indefinite"
                path={`M200 340 Q${150 + i * 30} ${370 + i * 5} ${100 + i * 40} ${380 + i * 5}`}
              />
              <animate attributeName="opacity" values="0;0.8;0" dur={`${3 + i}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </g>
        
        {/* Trunk - Daily Spending (breathing animation) */}
        <g>
          <path 
            d="M182 340 Q175 280 180 220 Q188 150 200 130 Q212 150 220 220 Q225 280 218 340 Z"
            fill="url(#trunkGradient)"
            filter="url(#softGlow)"
          >
            <animate 
              attributeName="d" 
              values="M182 340 Q175 280 180 220 Q188 150 200 130 Q212 150 220 220 Q225 280 218 340 Z;M180 340 Q173 280 178 220 Q186 150 200 125 Q214 150 222 220 Q227 280 220 340 Z;M182 340 Q175 280 180 220 Q188 150 200 130 Q212 150 220 220 Q225 280 218 340 Z"
              dur="4s"
              repeatCount="indefinite"
            />
          </path>
          {/* Trunk texture lines */}
          {[260, 290, 320].map((y, i) => (
            <path 
              key={i}
              d={`M${188 + i} ${y} Q200 ${y - 5} ${212 - i} ${y}`}
              stroke="rgba(0,0,0,0.2)"
              strokeWidth="1.5"
              fill="none"
            />
          ))}
          {/* Branches (swaying) */}
          <path 
            d="M188 295 Q155 255 130 235"
            stroke={treeColor}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          >
            <animate 
              attributeName="d" 
              values="M188 295 Q155 255 130 235;M188 295 Q158 258 135 240;M188 295 Q155 255 130 235"
              dur="5s"
              repeatCount="indefinite"
            />
          </path>
          <path 
            d="M212 275 Q245 235 275 215"
            stroke={treeColor}
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
          >
            <animate 
              attributeName="d" 
              values="M212 275 Q245 235 275 215;M212 275 Q242 232 270 210;M212 275 Q245 235 275 215"
              dur="4.5s"
              repeatCount="indefinite"
            />
          </path>
          {/* Smaller branches */}
          <path d="M195 250 Q170 230 155 220" stroke={treeColor} strokeWidth="6" fill="none" strokeLinecap="round">
            <animate attributeName="d" values="M195 250 Q170 230 155 220;M195 250 Q172 233 158 225;M195 250 Q170 230 155 220" dur="4s" repeatCount="indefinite" />
          </path>
          <path d="M205 260 Q230 245 250 240" stroke={treeColor} strokeWidth="6" fill="none" strokeLinecap="round">
            <animate attributeName="d" values="M205 260 Q230 245 250 240;M205 260 Q228 242 248 235;M205 260 Q230 245 250 240" dur="4.2s" repeatCount="indefinite" />
          </path>
        </g>
        
        {/* Leaves/Canopy - Savings Growth (swaying and breathing) */}
        <g>
          {/* Main canopy clusters with individual animations */}
          {[
            { cx: 200, cy: 95, rx: 65 + growthLevel * 0.5, ry: 55 + growthLevel * 0.4, dur: "5s", o: 0.95 },
            { cx: 145, cy: 130, rx: 45 + growthLevel * 0.35, ry: 40 + growthLevel * 0.25, dur: "4.5s", o: 0.9 },
            { cx: 255, cy: 130, rx: 45 + growthLevel * 0.35, ry: 40 + growthLevel * 0.25, dur: "4.8s", o: 0.9 },
            { cx: 120, cy: 175, rx: 35 + growthLevel * 0.25, ry: 30 + growthLevel * 0.2, dur: "4.2s", o: 0.85 },
            { cx: 280, cy: 175, rx: 35 + growthLevel * 0.25, ry: 30 + growthLevel * 0.2, dur: "4.4s", o: 0.85 },
            { cx: 175, cy: 65, rx: 30, ry: 25, dur: "3.8s", o: 0.95 },
            { cx: 225, cy: 70, rx: 28, ry: 23, dur: "4s", o: 0.95 },
            { cx: 200, cy: 50, rx: 25, ry: 20, dur: "3.5s", o: 0.9 },
            { cx: 155, cy: 100, rx: 22, ry: 18, dur: "3.9s", o: 0.85 },
            { cx: 245, cy: 100, rx: 22, ry: 18, dur: "4.1s", o: 0.85 },
          ].map((leaf, i) => (
            <ellipse 
              key={i}
              cx={leaf.cx} 
              cy={leaf.cy} 
              rx={leaf.rx} 
              ry={leaf.ry} 
              fill="url(#leafGradient)" 
              opacity={leaf.o}
            >
              <animate 
                attributeName="cx" 
                values={`${leaf.cx};${leaf.cx + 3};${leaf.cx - 2};${leaf.cx}`} 
                dur={leaf.dur} 
                repeatCount="indefinite" 
              />
              <animate 
                attributeName="rx" 
                values={`${leaf.rx};${leaf.rx + 3};${leaf.rx}`} 
                dur={`${parseFloat(leaf.dur) + 0.5}s`} 
                repeatCount="indefinite" 
              />
            </ellipse>
          ))}
          
          {/* Leaf sparkles when healthy */}
          {growthLevel > 60 && [...Array(6)].map((_, i) => (
            <circle
              key={i}
              cx={150 + i * 20}
              cy={80 + (i % 3) * 30}
              r="2"
              fill="#fff"
              opacity="0"
            >
              <animate 
                attributeName="opacity" 
                values="0;0.8;0" 
                dur={`${1.5 + i * 0.3}s`} 
                repeatCount="indefinite" 
                begin={`${i * 0.5}s`}
              />
            </circle>
          ))}
        </g>
        
        {/* Fruits - Goals Achieved (bouncing and glowing) */}
        {Array.from({ length: Math.min(fruitsCount, 5) }).map((_, i) => {
          const positions = [
            { x: 155, y: 85 },
            { x: 245, y: 90 },
            { x: 125, y: 145 },
            { x: 275, y: 150 },
            { x: 200, y: 60 },
          ]
          return (
            <g key={i}>
              {/* Fruit glow */}
              <circle 
                cx={positions[i].x} 
                cy={positions[i].y} 
                r="18" 
                fill="#f472b6"
                opacity="0.3"
                filter="url(#glow)"
              >
                <animate attributeName="r" values="16;20;16" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.4;0.2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              {/* Main fruit */}
              <circle 
                cx={positions[i].x} 
                cy={positions[i].y} 
                r="13" 
                fill="#f472b6"
              >
                <animate 
                  attributeName="cy" 
                  values={`${positions[i].y};${positions[i].y - 3};${positions[i].y}`} 
                  dur={`${2.5 + i * 0.2}s`} 
                  repeatCount="indefinite" 
                />
              </circle>
              {/* Highlight */}
              <circle 
                cx={positions[i].x - 4} 
                cy={positions[i].y - 4} 
                r="4" 
                fill="rgba(255,255,255,0.5)"
              >
                <animate 
                  attributeName="cy" 
                  values={`${positions[i].y - 4};${positions[i].y - 7};${positions[i].y - 4}`} 
                  dur={`${2.5 + i * 0.2}s`} 
                  repeatCount="indefinite" 
                />
              </circle>
              {/* Stem */}
              <path 
                d={`M${positions[i].x} ${positions[i].y - 12} Q${positions[i].x + 3} ${positions[i].y - 18} ${positions[i].x + 6} ${positions[i].y - 15}`}
                stroke="#22c55e"
                strokeWidth="2"
                fill="none"
              />
            </g>
          )
        })}
        
        {/* Pests/Dry Leaves - Bad Habits (falling animation) */}
        {Array.from({ length: Math.min(pestsCount, 4) }).map((_, i) => {
          const positions = [
            { x: 290, y: 200 },
            { x: 110, y: 190 },
            { x: 310, y: 155 },
            { x: 90, y: 145 },
          ]
          return (
            <g key={i}>
              {/* Falling leaf */}
              <ellipse 
                cx={positions[i].x} 
                cy={positions[i].y} 
                rx="10" 
                ry="6" 
                fill="#78716c"
                opacity="0.8"
              >
                <animate 
                  attributeName="cy" 
                  values={`${positions[i].y};${positions[i].y + 60};${positions[i].y}`} 
                  dur={`${6 + i}s`} 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="cx" 
                  values={`${positions[i].x};${positions[i].x + 15};${positions[i].x - 10};${positions[i].x}`} 
                  dur={`${6 + i}s`} 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="opacity" 
                  values="0.8;0.4;0;0.8" 
                  dur={`${6 + i}s`} 
                  repeatCount="indefinite" 
                />
                <animateTransform 
                  attributeName="transform" 
                  type="rotate" 
                  values="0;180;360" 
                  dur={`${3 + i * 0.5}s`} 
                  repeatCount="indefinite" 
                />
              </ellipse>
            </g>
          )
        })}
        
        {/* Floating particles / pollen (when healthy) */}
        {growthLevel > 50 && [...Array(8)].map((_, i) => (
          <circle key={i} r="2" fill={i % 2 === 0 ? leafColor : "#f472b6"} opacity="0.6">
            <animate 
              attributeName="cx" 
              values={`${120 + i * 25};${130 + i * 25};${115 + i * 25};${120 + i * 25}`} 
              dur={`${4 + i * 0.5}s`} 
              repeatCount="indefinite" 
            />
            <animate 
              attributeName="cy" 
              values={`${180 - i * 10};${160 - i * 10};${170 - i * 10};${180 - i * 10}`} 
              dur={`${3 + i * 0.3}s`} 
              repeatCount="indefinite" 
            />
            <animate 
              attributeName="opacity" 
              values="0;0.7;0" 
              dur={`${3 + i * 0.4}s`} 
              repeatCount="indefinite" 
              begin={`${i * 0.5}s`}
            />
          </circle>
        ))}
        
        {/* Water drops going up to tree (nutrient flow) */}
        {trunkHealth > 40 && [...Array(3)].map((_, i) => (
          <circle key={i} r="3" fill="#60a5fa" opacity="0">
            <animate 
              attributeName="cy" 
              values="340;200;100" 
              dur={`${4 + i}s`} 
              repeatCount="indefinite" 
              begin={`${i * 1.5}s`}
            />
            <animate 
              attributeName="cx" 
              values={`${195 + i * 5};${198 + i * 3};${200}`} 
              dur={`${4 + i}s`} 
              repeatCount="indefinite" 
              begin={`${i * 1.5}s`}
            />
            <animate 
              attributeName="opacity" 
              values="0;0.8;0.6;0" 
              dur={`${4 + i}s`} 
              repeatCount="indefinite" 
              begin={`${i * 1.5}s`}
            />
            <animate 
              attributeName="r" 
              values="4;3;2" 
              dur={`${4 + i}s`} 
              repeatCount="indefinite" 
              begin={`${i * 1.5}s`}
            />
          </circle>
        ))}
      </svg>
      
      {/* CSS Floating particles overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${4 + (i % 3) * 2}px`,
              height: `${4 + (i % 3) * 2}px`,
              background: i % 3 === 0 ? 'rgba(244, 114, 182, 0.4)' : i % 3 === 1 ? 'rgba(139, 92, 246, 0.4)' : 'rgba(34, 197, 94, 0.4)',
              left: `${15 + i * 6}%`,
              top: `${15 + (i % 4) * 15}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${4 + (i % 3)}s`
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Health Indicator Card
function HealthCard({ 
  icon: Icon, 
  label, 
  value, 
  description, 
  color 
}: { 
  icon: React.ElementType
  label: string
  value: number
  description: string
  color: string
}) {
  const getStatus = (val: number) => {
    if (val >= 70) return { text: "Thriving", emoji: "Excellent!" }
    if (val >= 40) return { text: "Growing", emoji: "Good progress!" }
    return { text: "Needs Care", emoji: "Let's improve!" }
  }
  const status = getStatus(value)
  
  return (
    <div className="glass-card rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:scale-[1.02] transition-transform">
      <div className="absolute inset-0 opacity-10" style={{ background: `linear-gradient(135deg, ${color}, transparent)` }} />
      <div className="flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-lg font-bold text-foreground">{status.text}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color }}>{value}%</p>
        </div>
      </div>
      <Progress value={value} className="h-2" style={{ '--progress-color': color } as React.CSSProperties} />
      <p className="text-xs text-muted-foreground">{description}</p>
      <p className="text-sm font-medium" style={{ color }}>{status.emoji}</p>
    </div>
  )
}

export default function InsightsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [profileRes, transactionsRes, challengesRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("monthly_income, savings_goal, current_balance, total_savings, financial_personality")
        .eq("id", user.id)
        .single(),
      supabase
        .from("transactions")
        .select("*, categories(name, color)")
        .eq("user_id", user.id)
        .order("date", { ascending: true }),
      supabase
        .from("daily_challenges")
        .select("id, is_good_choice, date")
        .eq("user_id", user.id)
        .order("date", { ascending: true })
    ])

    if (profileRes.error) {
      window.location.href = "/onboarding"
      return
    }

    if (profileRes.data) setProfile(profileRes.data)
    if (transactionsRes.data) setTransactions(transactionsRes.data)
    if (challengesRes.data) setChallenges(challengesRes.data)
    setLoading(false)
  }

  // Calculate insights
  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const netSavings = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

  // Challenge performance
  const goodChoices = challenges.filter(c => c.is_good_choice).length
  const totalChallenges = challenges.length
  const challengeScore = totalChallenges > 0 ? (goodChoices / totalChallenges) * 100 : 50

  // Calculate tree health metrics
  const rootsHealth = Math.min(100, Math.max(0, challengeScore)) // Money habits from challenge performance
  const trunkHealth = Math.min(100, Math.max(0, totalExpenses > 0 ? Math.max(20, 100 - (totalExpenses / (totalIncome || 1)) * 80) : 80)) // Spending health
  const growthLevel = Math.min(100, Math.max(0, savingsRate * 2 + 30)) // Savings growth
  const goalProgress = profile?.savings_goal 
    ? Math.min(100, ((profile.total_savings || netSavings) / profile.savings_goal) * 100)
    : 0
  const fruitsCount = Math.floor(goalProgress / 20) // Goals achieved as fruits
  const badChoices = challenges.filter(c => !c.is_good_choice).length
  const pestsCount = Math.min(4, Math.floor(badChoices / 2)) // Bad habits as pests

  // Category breakdown for insights
  const categoryData = transactions
    .filter(t => t.type === "expense" && t.categories)
    .reduce((acc, t) => {
      const catName = t.categories?.name || "Other"
      const existing = acc.find(c => c.name === catName)
      if (existing) {
        existing.value += t.amount
      } else {
        acc.push({ 
          name: catName, 
          value: t.amount, 
          color: t.categories?.color || "#6b7280" 
        })
      }
      return acc
    }, [] as { name: string; value: number; color: string }[])
    .sort((a, b) => b.value - a.value)

  // Overall tree health
  const overallHealth = Math.round((rootsHealth + trunkHealth + growthLevel) / 3)

  // Generate personalized garden tips
  const gardenTips = []
  if (rootsHealth < 60) {
    gardenTips.push({ icon: Heart, text: "Water your roots! Make more mindful financial choices in daily challenges.", color: "#8b5cf6" })
  }
  if (trunkHealth < 60) {
    gardenTips.push({ icon: Droplets, text: "Your trunk needs attention. Try to reduce unnecessary spending to strengthen it.", color: "#22c55e" })
  }
  if (growthLevel < 50) {
    gardenTips.push({ icon: Sun, text: "Give your tree more sunlight! Increase your savings to help it grow taller.", color: "#eab308" })
  }
  if (pestsCount > 2) {
    gardenTips.push({ icon: Wind, text: "Blow away the pests! Avoid impulsive spending decisions.", color: "#f97316" })
  }
  if (gardenTips.length === 0) {
    gardenTips.push({ icon: Sparkles, text: "Your money tree is flourishing! Keep nurturing it with good habits.", color: "#22c55e" })
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-8 lg:pt-0">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <TreeDeciduous className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Your Money Tree
          </h1>
        </div>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Watch your financial health grow! Your habits are the roots, spending is the trunk, 
          savings help it grow, and goals become sweet fruits.
        </p>
      </div>

      {/* Tree Visualization */}
      <div className="glass-card rounded-3xl p-6 relative overflow-visible">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent rounded-3xl" />
        
        {/* Overall Health Badge */}
        <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2 border border-border/30">
          <div className={`w-3 h-3 rounded-full ${overallHealth >= 70 ? 'bg-green-500' : overallHealth >= 40 ? 'bg-yellow-500' : 'bg-orange-500'} animate-pulse`} />
          <span className="text-sm font-medium text-foreground">Tree Health: {overallHealth}%</span>
        </div>

        <FinancialTree 
          rootsHealth={rootsHealth}
          trunkHealth={trunkHealth}
          growthLevel={growthLevel}
          fruitsCount={fruitsCount}
          pestsCount={pestsCount}
        />

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Roots = Money Habits</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Trunk = Spending Health</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30">
            <Leaf className="w-3 h-3 text-lime-500" />
            <span className="text-muted-foreground">Leaves = Savings Growth</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30">
            <Apple className="w-3 h-3 text-pink-400" />
            <span className="text-muted-foreground">Fruits = Goals Met</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/30">
            <Bug className="w-3 h-3 text-stone-400" />
            <span className="text-muted-foreground">Pests = Bad Habits</span>
          </div>
        </div>
      </div>

      {/* Health Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthCard 
          icon={Heart}
          label="Roots (Habits)"
          value={Math.round(rootsHealth)}
          description="Based on your daily challenge choices"
          color="#8b5cf6"
        />
        <HealthCard 
          icon={TreeDeciduous}
          label="Trunk (Spending)"
          value={Math.round(trunkHealth)}
          description="How well you manage your expenses"
          color="#22c55e"
        />
        <HealthCard 
          icon={Leaf}
          label="Growth (Savings)"
          value={Math.round(growthLevel)}
          description="Your savings rate and progress"
          color="#84cc16"
        />
        <HealthCard 
          icon={Apple}
          label="Fruits (Goals)"
          value={Math.round(goalProgress)}
          description={`${fruitsCount} goal milestones reached!`}
          color="#f472b6"
        />
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 text-center space-y-1">
          <p className="text-sm text-muted-foreground">Total Earned</p>
          <p className="text-3xl font-bold text-green-500">${totalIncome.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Sunlight for your tree</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center space-y-1">
          <p className="text-sm text-muted-foreground">Total Spent</p>
          <p className="text-3xl font-bold text-pink-400">${totalExpenses.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Water usage</p>
        </div>
        <div className="glass-card rounded-2xl p-5 text-center space-y-1">
          <p className="text-sm text-muted-foreground">Net Savings</p>
          <p className={`text-3xl font-bold ${netSavings >= 0 ? 'text-primary' : 'text-orange-400'}`}>
            ${Math.abs(netSavings).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Growth nutrients</p>
        </div>
      </div>

      {/* Spending Breakdown Visual */}
      {categoryData.length > 0 && (
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            Where Your Water Goes (Spending)
          </h3>
          <div className="space-y-3">
            {categoryData.slice(0, 5).map((cat, index) => {
              const percentage = totalExpenses > 0 ? (cat.value / totalExpenses) * 100 : 0
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm text-foreground">{cat.name}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground">${cat.value.toLocaleString()}</span>
                  </div>
                  <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: cat.color,
                        boxShadow: `0 0 10px ${cat.color}50`
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Garden Tips */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h3 className="text-lg font-semibold text-foreground">Garden Tips for Your Money Tree</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {gardenTips.map((tip, index) => {
            const Icon = tip.icon
            return (
              <div 
                key={index} 
                className="flex items-start gap-3 p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-primary/30 transition-colors"
              >
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${tip.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: tip.color }} />
                </div>
                <p className="text-sm text-foreground leading-relaxed">{tip.text}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Goal Progress */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Apple className="w-5 h-5 text-pink-400" />
          Fruit Harvest Progress (Your Goal)
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                ${(profile?.total_savings || netSavings).toLocaleString()} saved
              </span>
              <span className="text-foreground font-medium">
                Goal: ${profile?.savings_goal?.toLocaleString() || 0}
              </span>
            </div>
            <div className="h-4 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-primary transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              />
            </div>
          </div>
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Apple 
                key={i} 
                className={`w-6 h-6 transition-all ${i < fruitsCount ? 'text-pink-400' : 'text-muted/30'}`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          {fruitsCount === 0 && "Keep saving to grow your first fruit!"}
          {fruitsCount > 0 && fruitsCount < 5 && `Amazing! You've grown ${fruitsCount} fruit${fruitsCount > 1 ? 's' : ''}! Keep going!`}
          {fruitsCount === 5 && "Congratulations! Your tree is fully loaded with fruits!"}
        </p>
      </div>
    </div>
  )
}

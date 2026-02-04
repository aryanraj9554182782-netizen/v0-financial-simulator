"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wallet, TrendingUp, Target, Sparkles, Shield, Gamepad2 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-blue">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold gradient-text">FinSim</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-foreground/80 hover:text-foreground hover:bg-muted/50">
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-primary hover:bg-primary/90 glow-blue">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span>Learn to manage money - risk free!</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-balance">
              <span className="text-foreground">Master Your</span>
              <br />
              <span className="gradient-text">Financial Future</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              The gamified financial simulator designed for teenagers. Learn budgeting, 
              saving, and investing through real-world scenarios - without risking a single penny.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="bg-primary hover:bg-primary/90 glow-blue gap-2 text-lg px-8 py-6">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6 border-border/50 hover:bg-muted/30 bg-transparent">
                  I have an account
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-5xl mx-auto">
            <div className="glass-card rounded-2xl p-6 space-y-4 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Set Financial Goals</h3>
              <p className="text-muted-foreground">
                Define your savings targets and track your progress with visual insights.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Daily Challenges</h3>
              <p className="text-muted-foreground">
                Face real-life financial scenarios and learn from your decisions.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4 hover:scale-105 transition-transform duration-300">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Unlock Investments</h3>
              <p className="text-muted-foreground">
                Master budgeting to unlock stock market and fund simulations.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-32 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 gradient-text">How It Works</h2>
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { step: "1", title: "Take the Quiz", desc: "Answer 5 questions about your money habits" },
                { step: "2", title: "Get Your Profile", desc: "Discover your financial personality" },
                { step: "3", title: "Track & Learn", desc: "Log expenses and face daily challenges" },
                { step: "4", title: "Level Up", desc: "Unlock investment simulations" },
              ].map((item) => (
                <div key={item.step} className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto text-xl font-bold text-primary glow-blue">
                    {item.step}
                  </div>
                  <h4 className="font-semibold text-foreground">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-24 text-center">
            <div className="inline-flex items-center gap-6 px-8 py-4 rounded-2xl glass-card">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">100% Safe</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-secondary" />
                <span className="text-sm text-muted-foreground">No Real Money</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground">Learn by Doing</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="container mx-auto px-6 py-8 mt-16 border-t border-border/30">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Built for the next generation</p>
            <p>FinSim - Financial Simulator</p>
          </div>
        </footer>
      </div>
    </div>
  )
}

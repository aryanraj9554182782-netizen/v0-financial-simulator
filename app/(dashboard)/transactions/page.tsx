"use client"

import React from "react"

import { useEffect, useState } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Loader2,
  Trash2,
  Filter
} from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  color: string
  icon: string
}

interface Transaction {
  id: string
  description: string
  amount: number
  type: string
  date: string
  category_id: string | null
  categories: Category | null
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all")
  
  // Form state
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [type, setType] = useState<"income" | "expense">("expense")
  const [categoryId, setCategoryId] = useState("")

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [transactionsRes, categoriesRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*, categories(*)")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
    ])

    if (transactionsRes.data) setTransactions(transactionsRes.data)
    if (categoriesRes.data) setCategories(categoriesRes.data)
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        description,
        amount: Number(amount),
        type,
        category_id: categoryId || null,
        date: new Date().toISOString().split('T')[0],
      })
      .select("*, categories(*)")
      .single()

    if (error) {
      toast.error("Failed to add transaction")
      setSubmitting(false)
      return
    }

    // Update profile balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_balance")
      .eq("id", user.id)
      .single()

    const balanceChange = type === "income" ? Number(amount) : -Number(amount)
    const newBalance = (profile?.current_balance || 0) + balanceChange

    await supabase
      .from("profiles")
      .update({ current_balance: newBalance })
      .eq("id", user.id)

    setTransactions([data, ...transactions])
    setIsOpen(false)
    resetForm()
    toast.success("Transaction added!")
  }

  async function handleDelete(id: string, txType: string, txAmount: number) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)

    if (error) {
      toast.error("Failed to delete transaction")
      return
    }

    // Revert balance change
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_balance")
      .eq("id", user.id)
      .single()

    const balanceChange = txType === "income" ? -txAmount : txAmount
    const newBalance = (profile?.current_balance || 0) + balanceChange

    await supabase
      .from("profiles")
      .update({ current_balance: newBalance })
      .eq("id", user.id)

    setTransactions(transactions.filter(t => t.id !== id))
    toast.success("Transaction deleted")
  }

  function resetForm() {
    setDescription("")
    setAmount("")
    setType("expense")
    setCategoryId("")
    setSubmitting(false)
  }

  const filteredTransactions = transactions.filter(tx => {
    if (filter === "all") return true
    return tx.type === filter
  })

  const totalIncome = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pt-8 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground mt-1">Track your income and expenses</p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 glow-purple gap-2">
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[oklch(0.4_0.12_280)] border-border/50 text-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-foreground">Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={type === "expense" ? "default" : "outline"}
                    onClick={() => setType("expense")}
                    className={type === "expense" 
                      ? "flex-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50" 
                      : "flex-1 bg-transparent border-border/50 text-foreground hover:bg-muted/30"}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Expense
                  </Button>
                  <Button
                    type="button"
                    variant={type === "income" ? "default" : "outline"}
                    onClick={() => setType("income")}
                    className={type === "income" 
                      ? "flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50" 
                      : "flex-1 bg-transparent border-border/50 text-foreground hover:bg-muted/30"}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Income
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was this for?"
                  required
                  className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-foreground">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
                />
              </div>

              {type === "expense" && (
                <div className="space-y-2">
                  <Label className="text-foreground">Category</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="bg-input border-border/50 text-foreground">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/30">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-foreground">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Transaction"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Total Income</p>
          <p className="text-2xl font-bold text-green-500">+${totalIncome.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold text-red-400">-${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Net Balance</p>
          <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-500' : 'text-red-400'}`}>
            ${(totalIncome - totalExpenses).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <div className="flex gap-2">
          {(["all", "income", "expense"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className={filter === f 
                ? "bg-primary/20 text-primary border-primary/50" 
                : "bg-transparent border-border/50 text-foreground hover:bg-muted/30"}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filteredTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${tx.categories?.color || '#6b7280'}20` }}
                  >
                    {tx.type === "income" ? (
                      <TrendingUp className="w-6 h-6 text-green-500" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{tx.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {tx.categories && (
                        <>
                          <span 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: tx.categories.color }}
                          />
                          <span>{tx.categories.name}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className={`font-semibold text-lg ${tx.type === "income" ? "text-green-500" : "text-red-400"}`}>
                    {tx.type === "income" ? "+" : "-"}${tx.amount.toLocaleString()}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(tx.id, tx.type, tx.amount)}
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-muted-foreground">
              {filter === "all" 
                ? "No transactions yet. Add your first one!"
                : `No ${filter} transactions found.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import { productsApi, ordersApi, Order, Product } from '@/lib/api'

interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  totalRevenue: number
  recentOrders: Array<{
    id: string
    customerName: string
    total: number
    status: string
    createdAt: string
  }>
}
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        const [products, orders] = await Promise.all([
          productsApi.getAll().catch(() => [] as Product[]),
          ordersApi.getAll().catch(() => [] as Order[])
        ])

        const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
        const customers = new Set<string>()
        orders.forEach(o => {
          if (o.customerEmail) customers.add(o.customerEmail.toLowerCase())
          else if (o.customerName) customers.add(o.customerName.toLowerCase())
        })

        const recentOrders = orders
          .slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map(o => ({
            id: o.id,
            customerName: o.customerName,
            total: o.total,
            status: o.status,
            createdAt: o.createdAt
          }))

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          totalCustomers: customers.size,
          totalRevenue,
          recentOrders
        })
      } catch (e) {
        console.error('Erreur lors du chargement des statistiques', e)
        setError('Erreur lors du chargement des statistiques')
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          totalCustomers: 0,
          totalRevenue: 0,
          recentOrders: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 rounded bg-muted/30 animate-pulse"></div>
                <div className="h-4 w-4 rounded bg-muted/30 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 rounded bg-muted/30 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  if (!stats) return null

  const statusColors = {
    PENDING: 'bg-muted/30 text-foreground',
    CONFIRMED: 'bg-primary/10 text-primary',
    PROCESSING: 'bg-accent/20 text-accent-foreground',
    SHIPPED: 'bg-accent/20 text-accent-foreground',
    DELIVERED: 'bg-primary/10 text-primary',
    CANCELLED: 'bg-destructive/10 text-destructive',
    REFUNDED: 'bg-muted/30 text-foreground'
  } as const
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 dark:from-primary/15 dark:to-secondary/15 ring-1 ring-border/50 hover:ring-primary/40 transition">
          <span className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/20 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-background/50 grid place-items-center ring-1 ring-border/40"><Package className="h-5 w-5 text-primary" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">+12% par rapport au mois dernier</p>
            <svg className="mt-3 h-8 w-full" viewBox="0 0 100 32" preserveAspectRatio="none">
              <defs>
                <linearGradient id="prodGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 24 L12 20 L24 22 L36 16 L48 18 L60 10 L72 12 L84 8 L100 6" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
              <path d="M0 24 L12 20 L24 22 L36 16 L48 18 L60 10 L72 12 L84 8 L100 6 L100 32 L0 32 Z" fill="url(#prodGradient)" />
            </svg>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-accent/10 to-primary/10 dark:from-accent/15 dark:to-primary/15 ring-1 ring-border/50 hover:ring-primary/40 transition">
          <span className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-accent/20 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-background/50 grid place-items-center ring-1 ring-border/40"><ShoppingCart className="h-5 w-5 text-primary" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+8% par rapport au mois dernier</p>
            <svg className="mt-3 h-8 w-full" viewBox="0 0 100 32" preserveAspectRatio="none">
              <defs>
                <linearGradient id="orderGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 26 L10 24 L20 25 L30 22 L40 23 L50 19 L60 17 L70 14 L80 13 L90 12 L100 10" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
              <path d="M0 26 L10 24 L20 25 L30 22 L40 23 L50 19 L60 17 L70 14 L80 13 L90 12 L100 10 L100 32 L0 32 Z" fill="url(#orderGradient)" />
            </svg>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-secondary/10 to-primary/10 dark:from-secondary/15 dark:to-primary/15 ring-1 ring-border/50 hover:ring-primary/40 transition">
          <span className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-secondary/20 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-background/50 grid place-items-center ring-1 ring-border/40"><Users className="h-5 w-5 text-primary" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">+15% par rapport au mois dernier</p>
            <svg className="mt-3 h-8 w-full" viewBox="0 0 100 32" preserveAspectRatio="none">
              <defs>
                <linearGradient id="custGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 22 L12 18 L24 20 L36 18 L48 20 L60 16 L72 18 L84 14 L100 12" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
              <path d="M0 22 L12 18 L24 20 L36 18 L48 20 L60 16 L72 18 L84 14 L100 12 L100 32 L0 32 Z" fill="url(#custGradient)" />
            </svg>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 dark:from-primary/15 dark:to-accent/15 ring-1 ring-border/50 hover:ring-primary/40 transition">
          <span className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-primary/30 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-background/50 grid place-items-center ring-1 ring-border/40"><TrendingUp className="h-5 w-5 text-primary" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">+20% par rapport au mois dernier</p>
            <svg className="mt-3 h-8 w-full" viewBox="0 0 100 32" preserveAspectRatio="none">
              <defs>
                <linearGradient id="revGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0 28 L10 26 L20 24 L30 22 L40 20 L50 18 L60 16 L70 14 L80 12 L90 10 L100 8" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" />
              <path d="M0 28 L10 26 L20 24 L30 22 L40 20 L50 18 L60 16 L70 14 L80 12 L90 10 L100 8 L100 32 L0 32 Z" fill="url(#revGradient)" />
            </svg>
          </CardContent>
        </Card>
      </div>
      {/* Recent Orders */}
      <Card className="group relative overflow-hidden bg-card/80 backdrop-blur-md border-border/60 ring-1 ring-border/40">
        <span className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
          <CardDescription>Aperçu des dernières commandes reçues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentOrders.map((order) => {
              const statusClass = (statusColors as any)[order.status] || 'bg-muted/30 text-foreground'
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/15 hover:bg-muted/25 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">#{order.id} • {formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-border/50 ${statusClass}`}>{order.status}</span>
                    <span className="font-medium">{formatPrice(order.total)}</span>
                  </div>
                </div>
              )
            })}
            {stats.recentOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">Aucune commande récente</div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}

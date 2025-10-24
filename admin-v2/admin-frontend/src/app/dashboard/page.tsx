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
        const [products, orders] = await Promise.all<[
          Product[],
          Order[]
        ]>([
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
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }
  if (!stats) return null

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-indigo-100 text-indigo-800',
    SHIPPED: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-200 text-gray-800'
  } as const
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center dark:bg-primary/20"><Package className="h-5 w-5 text-primary" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center dark:bg-primary/20"><ShoppingCart className="h-5 w-5 text-primary" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +8% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center dark:bg-primary/20"><Users className="h-5 w-5 text-primary" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +15% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center dark:bg-primary/20"><TrendingUp className="h-5 w-5 text-primary" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              +20% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes récentes</CardTitle>
          <CardDescription>
            Aperçu des dernières commandes reçues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentOrders.map((order) => {
              const statusClass = (statusColors as any)[order.status] || 'bg-gray-100 text-gray-800'
              return (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-sm text-muted-foreground">
                        #{order.id} • {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-border/50 ${statusClass}`}>
                      {order.status}
                    </span>
                    <span className="font-medium">{formatPrice(order.total)}</span>
                  </div>
                </div>
              )
            })}
            {stats.recentOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune commande récente
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Separator } from '@/components/ui/Separator'
import { ordersApi, productsApi, Order, Product } from '@/lib/api'
import { TrendingUp } from 'lucide-react'

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [o, p] = await Promise.all([
          ordersApi.getAll(),
          productsApi.getAll(),
        ])
        if (!mounted) return
        setOrders(o)
        setProducts(p)
      } catch (e: any) {
        if (!mounted) return
        setError('Impossible de charger les données')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])
  const metrics = useMemo(() => {
    const orderCount = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
    const avgOrderValue = orderCount ? (totalRevenue / orderCount) : 0

    // Aggregate top products by quantity via orders items
    const productMap = new Map<string, number>()
    for (const o of orders) {
      for (const item of o.items || []) {
        const key = item.productName || item.productId
        productMap.set(key, (productMap.get(key) || 0) + (item.quantity || 0))
      }
    }
    const topProducts = Array.from(productMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, qty]) => ({ name, qty }))

    return { orderCount, totalRevenue, avgOrderValue, topProducts }
  }, [orders])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">Vue d'ensemble des performances</p>
        </div>
      </div>

      {error && (
        <Card>
          <CardHeader>
            <CardTitle>Erreur</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenu total</CardTitle>
            <TrendingUp className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics.totalRevenue.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground">Somme des montants de commandes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nombre de commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics.orderCount}</div>
            <p className="text-xs text-muted-foreground">Sur la période complète</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Panier moyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{metrics.avgOrderValue.toFixed(2)} TND</div>
            <p className="text-xs text-muted-foreground">Revenu / commandes</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Top Produits (quantités)</CardTitle>
          <CardDescription>Basé sur les articles de commandes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : metrics.topProducts.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucune donnée disponible</div>
          ) : (
            <ul className="space-y-2">
              {metrics.topProducts.map((p) => (
                <li key={p.name} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="text-muted-foreground">{p.qty}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

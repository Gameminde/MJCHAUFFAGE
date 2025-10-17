"use client"

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Separator } from '@/components/ui/Separator'
import { ordersApi, Order } from '@/lib/api'

interface CustomerRow {
  name: string
  email: string
  orders: number
  totalSpent: number
}

export default function ClientsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await ordersApi.getAll()
        if (!mounted) return
        setOrders(data)
      } catch (e) {
        if (!mounted) return
        setError('Impossible de charger les commandes')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const rows = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>()
    for (const o of orders) {
      const key = o.customerEmail || o.customerName
      if (!key) continue
      const curr = map.get(key) || {
        name: o.customerName || 'Client',
        email: o.customerEmail || '',
        orders: 0,
        totalSpent: 0,
      }
      curr.orders += 1
      curr.totalSpent += o.total || 0
      map.set(key, curr)
    }
    let arr = Array.from(map.values())
    if (query) {
      const q = query.toLowerCase()
      arr = arr.filter(r => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
    }
    return arr.sort((a, b) => b.totalSpent - a.totalSpent)
  }, [orders, query])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        <p className="text-muted-foreground">Gestion des clients et prospects</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des clients</CardTitle>
          <CardDescription>
            Synthèse basée sur les commandes. Connectez l'API clients pour des détails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <Input
              placeholder="Rechercher par nom ou email"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
          {loading ? (
            <div className="text-sm text-muted-foreground">Chargement...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">Aucun client trouvé</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Nom</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Commandes</th>
                    <th className="py-2 pr-4">Total dépensé</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.email || r.name} className="border-b hover:bg-muted/30">
                      <td className="py-2 pr-4 font-medium text-foreground">{r.name}</td>
                      <td className="py-2 pr-4 text-muted-foreground">{r.email}</td>
                      <td className="py-2 pr-4">{r.orders}</td>
                      <td className="py-2 pr-4">{r.totalSpent.toFixed(2)} TND</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>À venir: export CSV, segmentation, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Fonctionnalités avancées seront intégrées prochainement.</div>
        </CardContent>
      </Card>
    </div>
  )
}

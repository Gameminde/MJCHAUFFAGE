'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Search, Eye, Package, Truck, CheckCircle, Clock, XCircle, RotateCcw } from 'lucide-react'
import { ordersApi, Order } from '@/lib/api'
import { formatDate, formatPrice } from '@/lib/utils'

const statusConfig = {
  PENDING: { label: 'En attente', color: 'bg-yellow-50 text-yellow-700', icon: Clock },
  PROCESSING: { label: 'En cours', color: 'bg-blue-50 text-blue-700', icon: Package },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-50 text-blue-700', icon: Package },
  SHIPPED: { label: 'Expédiée', color: 'bg-purple-50 text-purple-700', icon: Truck },
  DELIVERED: { label: 'Livrée', color: 'bg-green-50 text-green-700', icon: CheckCircle },
  CANCELLED: { label: 'Annulée', color: 'bg-red-50 text-red-700', icon: XCircle },
  REFUNDED: { label: 'Remboursée', color: 'bg-orange-50 text-orange-700', icon: RotateCcw },
} as const

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await ordersApi.getAll()
      setOrders(data)
    } catch (err) {
      setError('Erreur lors du chargement des commandes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus as Order['status'])
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ))
    } catch (err) {
      setError('Erreur lors de la mise à jour du statut')
      console.error(err)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground">
            Gérez toutes les commandes clients
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'PROCESSING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livrées</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'DELIVERED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
          <CardDescription>
            Toutes les commandes avec leur statut actuel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro ou client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="ALL">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="PROCESSING">En cours</option>
              <option value="CONFIRMED">Confirmée</option>
              <option value="SHIPPED">Expédiée</option>
              <option value="DELIVERED">Livrée</option>
              <option value="CANCELLED">Annulée</option>
              <option value="REFUNDED">Remboursée</option>
            </select>
          </div>

          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Commande
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Client
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Date
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Montant
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium">
                    Statut
                  </th>
                  <th className="h-12 px-4 text-right align-middle font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status as keyof typeof statusConfig]?.icon || Clock
                  return (
                    <tr key={order.id} className="border-b">
                      <td className="h-12 px-4 align-middle">
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.items.length} article(s)
                        </div>
                      </td>
                      <td className="h-12 px-4 align-middle">
                        <div className="font-medium">{order.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {order.customerEmail}
                        </div>
                      </td>
                      <td className="h-12 px-4 align-middle">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="h-12 px-4 align-middle font-medium">
                        {formatPrice(order.total)}
                      </td>
                      <td className="h-12 px-4 align-middle">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className="h-4 w-4" />
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            statusConfig[order.status as keyof typeof statusConfig]?.color || 'bg-gray-50 text-gray-700'
                          }`}>
                            {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                          </span>
                        </div>
                      </td>
                      <td className="h-12 px-4 align-middle text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                            className="px-2 py-1 border border-input bg-background rounded text-xs"
                          >
                            <option value="PENDING">En attente</option>
                            <option value="CONFIRMED">Confirmée</option>
                            <option value="SHIPPED">Expédiée</option>
                            <option value="DELIVERED">Livrée</option>
                            <option value="CANCELLED">Annulée</option>
                            <option value="REFUNDED">Remboursée</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || statusFilter !== 'ALL' ? 'Aucune commande trouvée' : 'Aucune commande disponible'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
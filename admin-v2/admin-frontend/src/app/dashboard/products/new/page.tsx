'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { productsApi, CreateProductRequest, Product, uploadsApi } from '@/lib/api'

const schema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  description: z.string().optional(),
  price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Prix invalide'),
  category: z.string().min(2, 'Catégorie requise'),
  stock: z.string().refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, 'Stock invalide'),
  isActive: z.boolean().optional()
})

type FormData = z.infer<typeof schema>

export default function NewProductPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      price: '0',
      category: 'Général',
      stock: '0',
      isActive: true
    }
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    setSuccess(null)
    setIsSubmitting(true)
    try {
      let uploadedImageUrl: string | undefined
      if (selectedFile) {
        uploadedImageUrl = await uploadsApi.uploadImage(selectedFile)
      }
      const payload: CreateProductRequest = {
        name: data.name.trim(),
        description: data.description?.trim(),
        price: Number(data.price),
        category: data.category.trim(),
        stock: Number(data.stock),
        images: uploadedImageUrl ? [uploadedImageUrl] : [],
        isActive: data.isActive ?? true,
      }

      const created: Product = await productsApi.create(payload)
      setSuccess('Produit créé avec succès')
      reset()
      // Rediriger vers la liste après une courte pause
      setTimeout(() => router.push('/dashboard/products'), 800)
    } catch (e: any) {
      console.error('Erreur création produit', e)
      const message = e?.response?.data?.message || 'Échec de la création du produit'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nouveau produit</h1>
          <p className="text-muted-foreground">Ajoutez un produit au catalogue</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations produit</CardTitle>
          <CardDescription>Renseignez les champs ci-dessous</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">{success}</div>
            )}

            <div>
              <Label htmlFor="name">Nom</Label>
              <Input id="name" placeholder="Nom du produit" {...register('name')} />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Description" {...register('description')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Prix (€)</Label>
                <Input id="price" type="number" step="0.01" {...register('price')} />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>}
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" step="1" {...register('stock')} />
                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input id="category" placeholder="Catégorie" {...register('category')} />
                {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
              </div>
              <div>
                <Label>Image (upload local)</Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null
                    setSelectedFile(file)
                    setPreviewUrl(file ? URL.createObjectURL(file) : null)
                  }}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-input file:text-sm file:bg-secondary file:text-secondary-foreground hover:file:bg-muted"
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img src={previewUrl} alt="Aperçu" className="h-24 w-24 object-cover rounded" />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Formats acceptés: JPG, PNG. Max 10MB.</p>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Création...' : 'Créer le produit'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
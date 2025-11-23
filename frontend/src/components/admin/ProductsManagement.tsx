'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Image as ImageIcon, X, Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react'
import NextImage from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getImageUrl } from '@/lib/images'

// Types matching Supabase schema
interface Product {
  id: string
  name: string
  slug: string
  sku: string
  description: string | null
  price: number
  sale_price: number | null
  stock_quantity: number
  is_active: boolean
  is_featured: boolean
  created_at: string
  category: { id: string; name: string } | null
  manufacturer: { id: string; name: string } | null
  product_images: { id: string; url: string; alt_text: string | null; sort_order: number }[]
  features: string[]
  specifications: Record<string, string>
}

export function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedManufacturer, setSelectedManufacturer] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    categoryId: '',
    manufacturerId: '',
    sku: '',
    stockQuantity: '',
    features: [''],
    specifications: {} as Record<string, string>,
    isActive: true,
    isFeatured: false
  })

  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Data for dropdowns
  const [categories, setCategories] = useState<any[]>([])
  const [manufacturers, setManufacturers] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingManufacturers, setLoadingManufacturers] = useState(false)

  const supabase = createClient()

  // Fetch Data
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch Products
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name),
          manufacturer:manufacturers(id, name),
          product_images(*)
        `)
        .order('created_at', { ascending: false })

      if (productsError) throw productsError
      setProducts(productsData || [])

      // Fetch Categories
      setLoadingCategories(true)
      const { data: catsData, error: catsError } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')

      if (catsError) throw catsError
      setCategories(catsData || [])
      setLoadingCategories(false)

      // Fetch Manufacturers
      setLoadingManufacturers(true)
      const { data: mansData, error: mansError } = await supabase
        .from('manufacturers')
        .select('id, name')
        .order('name')

      if (mansError) throw mansError
      setManufacturers(mansData || [])
      setLoadingManufacturers(false)

    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Form Handlers
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      categoryId: '',
      manufacturerId: '',
      sku: '',
      stockQuantity: '',
      features: [''],
      specifications: {},
      isActive: true,
      isFeatured: false
    })
    setUploadedImages([])
    setEditingProduct(null)
    setShowAddForm(false)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      salePrice: product.sale_price?.toString() || '',
      categoryId: product.category?.id || '',
      manufacturerId: product.manufacturer?.id || '',
      sku: product.sku || '',
      stockQuantity: product.stock_quantity.toString(),
      features: product.features || [''],
      specifications: product.specifications || {},
      isActive: product.is_active,
      isFeatured: product.is_featured
    })
    setUploadedImages(product.product_images?.map(img => img.url) || [])
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error

      setProducts(prev => prev.filter(p => p.id !== id))
      alert('Product deleted successfully')
    } catch (err: any) {
      console.error('Error deleting product:', err)
      alert('Failed to delete product: ' + err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        sale_price: formData.salePrice ? parseFloat(formData.salePrice) : null,
        category_id: formData.categoryId,
        manufacturer_id: formData.manufacturerId || null,
        sku: formData.sku,
        stock_quantity: parseInt(formData.stockQuantity),
        features: formData.features.filter(f => f.trim() !== ''),
        specifications: formData.specifications,
        is_active: formData.isActive,
        is_featured: formData.isFeatured,
        // Generate slug from name if not provided (simple version)
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4)
      }

      let productId = editingProduct?.id

      if (editingProduct) {
        // Update
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        // Create
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single()

        if (error) throw error
        productId = data.id
      }

      // Handle Images (Simple URL storage for now, assuming uploadedImages are URLs)
      // In a real app, we'd upload to Storage bucket first.
      // For this migration, we'll just delete old images and insert new ones for simplicity
      if (productId) {
        // Delete existing images
        await supabase.from('product_images').delete().eq('product_id', productId)

        // Insert new images
        if (uploadedImages.length > 0) {
          const imagesToInsert = uploadedImages.map((url, index) => ({
            product_id: productId,
            url: url,
            alt_text: formData.name,
            sort_order: index
          }))

          const { error: imgError } = await supabase.from('product_images').insert(imagesToInsert)
          if (imgError) console.error('Error saving images:', imgError)
        }
      }

      alert(editingProduct ? 'Product updated!' : 'Product created!')
      resetForm()
      fetchData()

    } catch (err: any) {
      console.error('Error saving product:', err)
      alert('Failed to save product: ' + err.message)
    }
  }

  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const newImages: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath)

        newImages.push(publicUrl)
      }

      setUploadedImages(prev => [...prev, ...newImages])
    } catch (error: any) {
      console.error('Error uploading image:', error)
      alert('Error uploading image: ' + error.message)
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = !selectedCategory || product.category?.id === selectedCategory
    const matchesManufacturer = !selectedManufacturer || product.manufacturer?.id === selectedManufacturer
    return matchesSearch && matchesCategory && matchesManufacturer
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-neutral-900">Gestion des Produits</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input pl-10 w-64"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-input w-auto"
          >
            <option value="">Toutes catégories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={selectedManufacturer}
            onChange={(e) => setSelectedManufacturer(e.target.value)}
            className="form-input w-auto"
          >
            <option value="">Toutes marques</option>
            {manufacturers.map(man => (
              <option key={man.id} value={man.id}>{man.name}</option>
            ))}
          </select>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter Produit
          </button>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{editingProduct ? 'Modifier Produit' : 'Nouveau Produit'}</h3>
            <button onClick={resetForm}><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Nom</label>
                <input type="text" className="form-input" required
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="form-label">SKU</label>
                <input type="text" className="form-input" required
                  value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea className="form-input h-24"
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="form-label">Prix</label>
                <input type="number" className="form-input" required min="0" step="0.01"
                  value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Prix Promo</label>
                <input type="number" className="form-input" min="0" step="0.01"
                  value={formData.salePrice} onChange={e => setFormData({ ...formData, salePrice: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Stock</label>
                <input type="number" className="form-input" required min="0"
                  value={formData.stockQuantity} onChange={e => setFormData({ ...formData, stockQuantity: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Catégorie</label>
                <select className="form-input" required
                  value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })}>
                  <option value="">Sélectionner...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Fabricant</label>
                <select className="form-input"
                  value={formData.manufacturerId} onChange={e => setFormData({ ...formData, manufacturerId: e.target.value })}>
                  <option value="">Aucun</option>
                  {manufacturers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>

            {/* Image Upload Section */}
            <div>
              <label className="form-label mb-2">Images du produit</label>
              <div className="flex flex-col gap-4">
                <label className={`btn-secondary cursor-pointer inline-flex items-center w-fit ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Téléchargement...' : 'Ajouter des images'}
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {uploadedImages.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                        <NextImage
                          src={getImageUrl(url)}
                          alt={`Image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 text-center">
                            Principale
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                Actif
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} />
                Mis en avant
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <button type="button" onClick={resetForm} className="btn-secondary">Annuler</button>
              <button type="submit" className="btn-primary" disabled={uploading}>
                {uploading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="card overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-4">Chargement...</td></tr>
            ) : filteredProducts.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-4">Aucun produit trouvé</td></tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <NextImage
                          src={getImageUrl(product.product_images?.[0]?.url || '')}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.price} DA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.stock_quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {product.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
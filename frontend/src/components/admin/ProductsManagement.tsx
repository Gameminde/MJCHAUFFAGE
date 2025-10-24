'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, Image, X, Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react'
import { useProductRealtime } from '@/hooks/useRealtime'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  originalPrice?: number
  category: string
  brand: string
  images: string[]
  inStock: boolean
  stockQuantity: number
  features: string[]
  specifications: Record<string, string>
  isActive: boolean
  isFeatured: boolean
  createdAt: string
}

// Import the real product service
import ProductService from '@/services/productService'

// Convert the backend Product interface to match frontend needs
interface FrontendProduct {
  id: string
  name: string
  description: string | null
  price: number
  originalPrice?: number
  category: string
  brand: string
  images: string[]
  inStock: boolean
  stockQuantity: number
  features: string[]
  specifications: Record<string, string>
  isActive: boolean
  isFeatured: boolean
  createdAt: string
}

// Convert backend product to frontend product
const convertProduct = (product: any): FrontendProduct => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  originalPrice: product.salePrice || undefined,
  category: product.category?.name || '',
  brand: product.manufacturer?.name || '',
  images: product.images?.map((img: any) => img.url) || [],
  inStock: product.stockQuantity > 0,
  stockQuantity: product.stockQuantity,
  features: product.features || [],
  specifications: product.specifications || {},
  isActive: product.isActive,
  isFeatured: product.isFeatured,
  createdAt: product.createdAt
})

export function ProductsManagement() {
  const [products, setProducts] = useState<FrontendProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    categoryId: '',
    manufacturerId: '',
    stockQuantity: '',
    features: [''],
    specifications: {} as Record<string, string>,
    isActive: true,
    isFeatured: false
  })

  const [realCategories, setRealCategories] = useState<any[]>([])
  const [manufacturers, setManufacturers] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingManufacturers, setLoadingManufacturers] = useState(false)

  // Real-time updates
  const { 
    onProductCreated, 
    onProductUpdated, 
    onProductDeleted, 
    notifyProductChange,
    isConnected,
    cleanup 
  } = useProductRealtime()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch products
        const backendProducts = await ProductService.getProducts()
        const frontendProducts = backendProducts.map(convertProduct)
        setProducts(frontendProducts)
        
        // Fetch categories
        setLoadingCategories(true)
        try {
          const categoriesData = await ProductService.getCategories()
          setRealCategories(categoriesData)
        } catch (catErr) {
          console.error('Error fetching categories:', catErr)
        } finally {
          setLoadingCategories(false)
        }
        
        // Fetch manufacturers
        setLoadingManufacturers(true)
        try {
          const manufacturersData = await ProductService.getManufacturers()
          setManufacturers(manufacturersData)
        } catch (manErr) {
          console.error('Error fetching manufacturers:', manErr)
        } finally {
          setLoadingManufacturers(false)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Set up real-time listeners
  useEffect(() => {
    onProductCreated((newProduct: any) => {
      const frontendProduct = convertProduct(newProduct)
      setProducts(prev => [frontendProduct, ...prev])
    })

    onProductUpdated((updatedProduct: any) => {
      const frontendProduct = convertProduct(updatedProduct)
      setProducts(prev => prev.map(p => p.id === frontendProduct.id ? frontendProduct : p))
    })

    onProductDeleted((productId: string) => {
      setProducts(prev => prev.filter(p => p.id !== productId))
    })

    return cleanup
  }, [onProductCreated, onProductUpdated, onProductDeleted, cleanup])

  // Fallback categories if API fails
  const fallbackCategories = [
    { id: 'boilers', name: 'Chaudières', value: 'boilers', label: 'Chaudières' },
    { id: 'radiators', name: 'Radiateurs', value: 'radiators', label: 'Radiateurs' },
    { id: 'thermostats', name: 'Thermostats', value: 'thermostats', label: 'Thermostats' },
    { id: 'accessories', name: 'Accessoires', value: 'accessories', label: 'Accessoires' }
  ]
  
  const categories = realCategories.length > 0 
    ? realCategories.map(cat => ({ id: cat.id, name: cat.name, value: cat.id, label: cat.name }))
    : fallbackCategories

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setUploadedImages(prev => [...prev, e.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }))
  }

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleFeatureChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }))
  }

  const handleAddSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, '': '' }
    }))
  }

  const handleSpecificationChange = (oldKey: string, newKey: string, value: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications } as Record<string, string>
      if (oldKey !== newKey) {
        delete newSpecs[oldKey]
      }
      newSpecs[newKey] = value
      return { ...prev, specifications: newSpecs }
    })
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      categoryId: '',
      manufacturerId: '',
      stockQuantity: '',
      features: [''],
      specifications: {} as Record<string, string>,
      isActive: true,
      isFeatured: false
    })
    setUploadedImages([])
    setEditingProduct(null)
    setShowAddForm(false)
  }

  // Helper function to generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Helper function to generate SKU
  const generateSKU = (name: string, categoryId: string): string => {
    const namePrefix = name.substring(0, 3).toUpperCase()
    const categoryPrefix = categoryId.substring(0, 3).toUpperCase()
    const timestamp = Date.now().toString().slice(-4)
    return `${namePrefix}-${categoryPrefix}-${timestamp}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {

      
      // Validate required fields
      if (!formData.name || !formData.categoryId || !formData.price || !formData.stockQuantity) {
        alert('Veuillez remplir tous les champs requis')
        return
      }

      // Generate slug and SKU
      const slug = generateSlug(formData.name)
      const sku = generateSKU(formData.name, formData.categoryId)

      // Prepare data for API (match backend expectations exactly)
      const productData: any = {
        name: formData.name,
        slug: slug,
        sku: sku,
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        isActive: formData.isActive,
        isFeatured: formData.isFeatured,
      }

      // Add optional fields only if they have values
      if (formData.description) {
        productData.description = formData.description
      }
      
      if (formData.salePrice) {
        productData.salePrice = parseFloat(formData.salePrice)
      }
      
      // Only send manufacturerId if it looks like a UUID (not a name)
      if (formData.manufacturerId && formData.manufacturerId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        productData.manufacturerId = formData.manufacturerId
      }
      // If it's a name like "chappee", don't send it (will be null in database)
      
      if (formData.features && formData.features.length > 0) {
        // Convert array to comma-separated string for SQLite
        productData.features = formData.features.filter(f => f.trim() !== '').join(',')
      }
      
      if (formData.specifications && Object.keys(formData.specifications).length > 0) {
        // Convert object to JSON string for SQLite
        productData.specifications = JSON.stringify(formData.specifications)
      }
      
      // Note: Images will be handled separately via upload endpoint
      // Do not send empty arrays or objects

      console.log('📦 Sending product data to backend:', JSON.stringify(productData, null, 2))

      if (editingProduct) {
        // Update existing product
        const updatedProduct = await ProductService.updateProduct(editingProduct.id, productData)
        notifyProductChange('updated', editingProduct.id, updatedProduct)
        alert('Produit mis à jour avec succès!')
      } else {
        // Create new product
        const newProduct = await ProductService.createProduct(productData)
        notifyProductChange('created', newProduct.id, newProduct)
        alert('Produit créé avec succès!')
      }
      
      resetForm()
      
      // Refresh products list
      const backendProducts = await ProductService.getProducts()
      const frontendProducts = backendProducts.map(convertProduct)
      setProducts(frontendProducts)
    } catch (err) {
      console.error('Error saving product:', err)
      // Log detailed error info
      if (err instanceof Error) {
        console.error('Error name:', err.name)
        console.error('Error message:', err.message)
        if ((err as any).response) {
          console.error('Response data:', (err as any).response)
        }
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to save product'
      alert(`Erreur: ${errorMessage}`)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      salePrice: product.originalPrice?.toString() || '',
      categoryId: product.category, // This will need to be mapped to actual category ID
      manufacturerId: product.brand, // This will need to be mapped to actual manufacturer ID
      stockQuantity: product.stockQuantity.toString(),
      features: product.features,
      specifications: product.specifications,
      isActive: product.isActive,
      isFeatured: product.isFeatured
    })
    setUploadedImages(product.images)
    setShowAddForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await ProductService.deleteProduct(id)
        notifyProductChange('deleted', id)
        alert('Produit supprimé avec succès!')
        
        // Refresh products list
        const backendProducts = await ProductService.getProducts()
        const frontendProducts = backendProducts.map(convertProduct)
        setProducts(frontendProducts)
      } catch (err) {
        console.error('Error deleting product:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete product'
        alert(`Erreur: ${errorMessage}`)
      }
    }
  }

  const toggleProductStatus = async (id: string, field: 'isActive' | 'isFeatured') => {
    try {
      // Find the current product to get its current status
      const currentProduct = products.find(p => p.id === id)
      if (!currentProduct) return

      // Update the product with the new status
      const updateData = {
        [field]: !currentProduct[field]
      }
      
      await ProductService.updateProduct(id, updateData)
      
      // Refresh products list
      const backendProducts = await ProductService.getProducts()
      const frontendProducts = backendProducts.map(convertProduct)
      setProducts(frontendProducts)
    } catch (err) {
      console.error('Error updating product status:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product status'
      alert(`Erreur: ${errorMessage}`)
    }
  }

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
              placeholder="Rechercher produits..."
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
            {categories && categories.length > 0 && categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
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

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold">
              {editingProduct ? 'Modifier le Produit' : 'Ajouter un Nouveau Produit'}
            </h3>
            <button 
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Nom du produit *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Fabricant *</label>
                  <input
                    type="text"
                    value={formData.manufacturerId}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturerId: e.target.value }))}
                    className="form-input"
                    placeholder="Ex: Viessmann, Bosch, Vaillant..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Tapez le nom du fabricant librement</p>
                </div>
              </div>

              <div>
                <label className="form-label">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="form-input h-24 resize-none"
                  required
                />
              </div>

              {/* Pricing and Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Prix (DA) *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Prix de vente (DA)</label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Catégorie *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="form-input"
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {categories && categories.length > 0 ? (
                      categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))
                    ) : (
                      <option value="boilers">Chaudières</option>
                    )}
                  </select>
                  {loadingCategories && <p className="text-sm text-gray-500 mt-1">Chargement des catégories...</p>}
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="form-label">Quantité en stock *</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, stockQuantity: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="form-checkbox"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                    Produit actif
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="form-checkbox"
                  />
                  <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-gray-700">
                    Produit vedette
                  </label>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="form-label">Images du produit</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Image className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Télécharger images
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      PNG, JPG, GIF jusqu'à 10MB chacune
                    </p>
                  </div>
                  
                  {/* Image Preview */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="form-label">Caractéristiques</label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="Caractéristique..."
                        className="form-input flex-1"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Ajouter caractéristique
                  </button>
                </div>
              </div>

              {/* Specifications */}
              <div>
                <label className="form-label">Spécifications techniques</label>
                <div className="space-y-2">
                  {Object.entries(formData.specifications).length === 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Nom de la spécification..."
                        className="form-input"
                        onChange={(e) => {
                          if (e.target.value) {
                            setFormData(prev => ({
                              ...prev,
                              specifications: { [e.target.value]: '' }
                            }))
                          }
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Valeur..."
                        className="form-input"
                        disabled
                      />
                    </div>
                  ) : (
                    Object.entries(formData.specifications).map(([key, value], index) => (
                      <div key={index} className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={key}
                          onChange={(e) => handleSpecificationChange(key, e.target.value, value)}
                          placeholder="Nom de la spécification..."
                          className="form-input"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => handleSpecificationChange(key, key, e.target.value)}
                          placeholder="Valeur..."
                          className="form-input"
                        />
                      </div>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={handleAddSpecification}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Ajouter spécification
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold">Liste des Produits ({filteredProducts.length})</h3>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-50 rounded-lg">
              <h3 className="text-lg font-semibold text-red-700">Erreur de chargement</h3>
              <p className="text-red-500 mt-2">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Image className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.brand}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {categories.find(c => c.value === product.category)?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.price.toLocaleString()} DA
                        </div>
                        {product.originalPrice && (
                          <div className="text-sm text-gray-500 line-through">
                            {product.originalPrice.toLocaleString()} DA
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.stockQuantity} unités
                        </div>
                        <div className={`text-xs ${
                          product.inStock ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.inStock ? 'En stock' : 'Rupture'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={product.isActive}
                              onChange={() => toggleProductStatus(product.id, 'isActive')}
                              className="form-checkbox h-3 w-3"
                            />
                            <span className="ml-1 text-xs text-gray-600">Actif</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={product.isFeatured}
                              onChange={() => toggleProductStatus(product.id, 'isFeatured')}
                              className="form-checkbox h-3 w-3"
                            />
                            <span className="ml-1 text-xs text-gray-600">Vedette</span>
                          </label>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
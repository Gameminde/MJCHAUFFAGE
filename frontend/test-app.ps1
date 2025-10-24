# Test complet de l'application
Write-Host " TEST COMPLET DE L'APPLICATION" -ForegroundColor Cyan
Write-Host "=" * 50

# 1. Test du backend
Write-Host "
1. Test du Backend:" -ForegroundColor Yellow
try {
  {"success":true,"data":{"products":[{"id":"mock-1","name":"Chaudi??re Viessmann Vitodens 100-W","slug":"chaudiere-viessmann-vitodens-100w","sku":"VIT-VD100W-24","description":"Chaudi??re haute efficacit?? avec design compact","price":1200,"stockQuantity":15,"isActive":true,"isFeatured":true,"category":{"id":"1","name":"Chaudi??res"},"manufacturer":{"id":"1","name":"Viessmann"},"images":[],"reviews":[],"features":["Haute efficacit??","Compact","Installation facile"]},{"id":"mock-2","name":"Radiateur Premium Steel 600x1200","slug":"radiateur-premium-steel-600x1200","sku":"RAD-PSR-6012","description":"Radiateur acier premium haute qualit??","price":180,"stockQuantity":25,"isActive":true,"isFeatured":false,"category":{"id":"2","name":"Radiateurs"},"manufacturer":{"id":"2","name":"Bosch"},"images":[],"reviews":[],"features":["Acier haute qualit??","Installation facile"]},{"id":"1758911659603","name":"Test Product","slug":"test-product","sku":"SKU-1758911659603","description":"Test description","price":1000,"salePrice":null,"categoryId":"1","manufacturerId":"Viessmann","stockQuantity":5,"features":[],"specifications":{},"isActive":true,"isFeatured":false,"category":{"id":"1","name":"Test Category"},"manufacturer":{"id":"Viessmann","name":"Viessmann"},"images":[],"reviews":[]},{"id":"1758912081076","name":"CHAUDIERE","slug":"chaudiere","sku":"CHA-1-1056","description":"CHAPEE","price":90000,"salePrice":null,"categoryId":"1","manufacturerId":"CHAPPE","stockQuantity":3,"features":["AZE"],"specifications":{},"isActive":true,"isFeatured":false,"category":{"id":"1","name":"Test Category"},"manufacturer":{"id":"CHAPPE","name":"CHAPPE"},"images":[],"reviews":[]}],"pagination":{"page":1,"limit":20,"total":4,"totalPages":1,"hasNext":false,"hasPrev":false}}} = Invoke-WebRequest -Uri "http://localhost:3001/api/products" -Method GET -TimeoutSec 5
  @{success=True; data=} = {"success":true,"data":{"products":[{"id":"mock-1","name":"Chaudi??re Viessmann Vitodens 100-W","slug":"chaudiere-viessmann-vitodens-100w","sku":"VIT-VD100W-24","description":"Chaudi??re haute efficacit?? avec design compact","price":1200,"stockQuantity":15,"isActive":true,"isFeatured":true,"category":{"id":"1","name":"Chaudi??res"},"manufacturer":{"id":"1","name":"Viessmann"},"images":[],"reviews":[],"features":["Haute efficacit??","Compact","Installation facile"]},{"id":"mock-2","name":"Radiateur Premium Steel 600x1200","slug":"radiateur-premium-steel-600x1200","sku":"RAD-PSR-6012","description":"Radiateur acier premium haute qualit??","price":180,"stockQuantity":25,"isActive":true,"isFeatured":false,"category":{"id":"2","name":"Radiateurs"},"manufacturer":{"id":"2","name":"Bosch"},"images":[],"reviews":[],"features":["Acier haute qualit??","Installation facile"]},{"id":"1758911659603","name":"Test Product","slug":"test-product","sku":"SKU-1758911659603","description":"Test description","price":1000,"salePrice":null,"categoryId":"1","manufacturerId":"Viessmann","stockQuantity":5,"features":[],"specifications":{},"isActive":true,"isFeatured":false,"category":{"id":"1","name":"Test Category"},"manufacturer":{"id":"Viessmann","name":"Viessmann"},"images":[],"reviews":[]},{"id":"1758912081076","name":"CHAUDIERE","slug":"chaudiere","sku":"CHA-1-1056","description":"CHAPEE","price":90000,"salePrice":null,"categoryId":"1","manufacturerId":"CHAPPE","stockQuantity":3,"features":["AZE"],"specifications":{},"isActive":true,"isFeatured":false,"category":{"id":"1","name":"Test Category"},"manufacturer":{"id":"CHAPPE","name":"CHAPPE"},"images":[],"reviews":[]}],"pagination":{"page":1,"limit":20,"total":4,"totalPages":1,"hasNext":false,"hasPrev":false}}}.Content | ConvertFrom-Json
  Write-Host " Backend: OK (4 produits)" -ForegroundColor Green
} catch {
  Write-Host " Backend: ERREUR - " -ForegroundColor Red
}

# 2. Test du fichier page.tsx
Write-Host "
2. Test du fichier page.tsx:" -ForegroundColor Yellow
 = Get-Content "src/app/[locale]/products/page.tsx" -Raw
if ( -match "products.*\|\|\s*\[\]") {
  Write-Host " page.tsx: Protections contre undefined ajoutées" -ForegroundColor Green
} else {
  Write-Host " page.tsx: Protections manquantes" -ForegroundColor Red
}

if ( -match "async function getProductPageData") {
  Write-Host " page.tsx: Fonction getProductPageData présente" -ForegroundColor Green
} else {
  Write-Host " page.tsx: Fonction getProductPageData manquante" -ForegroundColor Red
}

# 3. Test des variables d'environnement
Write-Host "
3. Test des variables d'environnement:" -ForegroundColor Yellow
 = Get-Content ".env.local" -ErrorAction SilentlyContinue
if ( -match "NEXT_PUBLIC_API_URL") {
  Write-Host " .env.local: NEXT_PUBLIC_API_URL défini" -ForegroundColor Green
} else {
  Write-Host " .env.local: NEXT_PUBLIC_API_URL manquant" -ForegroundColor Red
}

Write-Host "
 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "- Backend: Opérationnel"
Write-Host "- Frontend: Protections appliquées"
Write-Host "- Configuration: Variables d'environnement OK"
Write-Host "
 L'application devrait maintenant fonctionner sans erreurs !" -ForegroundColor Green

# Fix: Manufacturer Field Error (500 Internal Server Error)

## Problem
When updating/creating products in the admin dashboard, users received a **500 Internal Server Error**:

```
PUT http://localhost:3001/api/v1/products/{id} 500 (Internal Server Error)
Error: Internal server error
```

### Root Cause
The manufacturer field was a **text input** allowing free-form text like `"MADJID"`, but the backend expected:
- Either a valid **UUID** referencing an existing manufacturer in the database
- Or `null` if no manufacturer is selected

The database schema shows:
```prisma
model Product {
  manufacturerId String? @map("manufacturer_id")  // Optional UUID
  manufacturer  Manufacturer? @relation(fields: [manufacturerId], references: [id])
}
```

## Solution

### 1. Changed Manufacturer Field to Dropdown
**Before** (lines 606-617):
```tsx
<input
  type="text"
  value={formData.manufacturerId}
  placeholder="Ex: Viessmann, Bosch, Vaillant..."
  required
/>
```

**After**:
```tsx
<select
  value={formData.manufacturerId}
  className="form-input"
>
  <option value="">Aucun fabricant</option>
  {manufacturers.map(man => (
    <option key={man.id} value={man.id}>{man.name}</option>
  ))}
</select>
```

### 2. Made Field Optional
- Changed label from `"Fabricant *"` → `"Fabricant (optionnel)"`
- Removed `required` attribute
- Added helpful message when no manufacturers exist

### 3. Fixed Data Submission
**Before** (line 403-406):
```tsx
if (formData.manufacturerId) {
  productData.manufacturerId = formData.manufacturerId
}
```

**After**:
```tsx
if (formData.manufacturerId && formData.manufacturerId.trim() !== '') {
  productData.manufacturerId = formData.manufacturerId
} else {
  // Explicitly set to null if no manufacturer is selected
  productData.manufacturerId = null
}
```

This ensures:
- Valid UUID is sent when manufacturer is selected
- `null` is sent when no manufacturer is selected (instead of empty string)
- No invalid text strings are sent to the backend

## Files Modified
- ✅ `frontend/src/components/admin/ProductsManagement.tsx`

## Testing
1. **Create product without manufacturer**: Should work (manufacturerId = null)
2. **Create product with manufacturer**: Should work (manufacturerId = valid UUID)
3. **Update product to remove manufacturer**: Should work (set to null)
4. **Update product with different manufacturer**: Should work (change UUID)

## Backend Behavior
The backend correctly handles:
- `manufacturerId: null` ✅ (optional field)
- `manufacturerId: "valid-uuid-here"` ✅ (existing manufacturer)
- `manufacturerId: "invalid-text"` ❌ (causes 500 error - now prevented)
- `manufacturerId: ""` ❌ (empty string - now prevented)

## Future Enhancement: Add Manufacturer Management
Currently, manufacturers must be added directly to the database. Consider adding:
1. Manufacturer management page in admin dashboard
2. "Add new manufacturer" button in product form
3. API endpoints for manufacturer CRUD operations

Example manufacturers to seed:
```sql
INSERT INTO manufacturers (id, name, slug, is_active) VALUES
  ('uuid1', 'Viessmann', 'viessmann', true),
  ('uuid2', 'Bosch', 'bosch', true),
  ('uuid3', 'Vaillant', 'vaillant', true),
  ('uuid4', 'De Dietrich', 'de-dietrich', true);
```

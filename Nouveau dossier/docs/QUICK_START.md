# Quick Start - Service Booking System

## 🚀 1-Minute Setup

### Prerequisites
- Node.js installed
- Backend and Frontend dependencies installed
- Database configured

### Start Everything

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## 🧪 Quick Test

1. **Open browser:** http://localhost:3000/fr/services

2. **What you should see:**
   - Modern hero section with orange gradient
   - Services grid (may be empty if no data)
   - 4-step process section
   - CTA buttons

3. **Test booking:**
   - Click any "Réserver" button
   - Modal opens with booking form
   - Try submitting (will fail if not logged in)

## 📝 Create Test Service

If services page is empty, create a test service:

```bash
curl -X POST http://localhost:3001/api/v1/services/types \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Réparation Chaudière",
    "description": "Service de réparation et maintenance",
    "duration": 120,
    "price": 5000,
    "isActive": true
  }'
```

Or use this Windows PowerShell version:
```powershell
$body = @{
    name = "Réparation Chaudière"
    description = "Service de réparation et maintenance"
    duration = 120
    price = 5000
    isActive = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/v1/services/types" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

## ✅ Expected Results

### Services Page Loads
- ✅ Hero section displays
- ✅ Service cards render
- ✅ Buttons are clickable
- ✅ Responsive on mobile

### Modal Opens
- ✅ Backdrop appears
- ✅ Form fields visible
- ✅ Date picker works
- ✅ Can close modal

### Form Validation
- ❌ Empty form → Shows errors
- ❌ Short description (<10 chars) → Error
- ✅ Valid form → Submits or shows auth error

## 🔍 Troubleshooting

### Services Don't Show
```bash
# Check backend
curl http://localhost:3001/api/v1/services/types
```

### Modal Doesn't Open
- Check browser console (F12)
- Look for JavaScript errors
- Verify lucide-react is installed

### Can't Submit Form
- **"Vous devez être connecté"** → Normal, need to login first
- Other errors → Check browser console

## 📱 Test on Mobile

1. Get your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `.env.local`: `NEXT_PUBLIC_APP_URL=http://YOUR-IP:3000`
3. Open on phone: `http://YOUR-IP:3000/fr/services`

## 🎨 Visual Checklist

### Desktop (1920x1080)
- [ ] Hero takes ~618px height
- [ ] 3 service cards per row
- [ ] Smooth hover animations
- [ ] Modal centers properly

### Tablet (768x1024)
- [ ] Hero stacks content
- [ ] 2 service cards per row
- [ ] Modal fits screen
- [ ] Touch targets are large

### Mobile (375x667)
- [ ] Hero text readable
- [ ] 1 service card per row
- [ ] Modal scrolls properly
- [ ] Buttons are tappable

## 🌍 Test Bilingual

### French (default)
```
http://localhost:3000/fr/services
```

### Arabic (RTL)
```
http://localhost:3000/ar/services
```

**Check:**
- [ ] Text direction correct
- [ ] Icons flip position
- [ ] Modal layout mirrors
- [ ] Numbers format correctly

## 🎯 Full Test Flow

1. ✅ View services page
2. ✅ Click "Réserver" button
3. ✅ Modal opens
4. ✅ Select date/time
5. ✅ Fill description
6. ✅ Choose priority
7. ✅ Submit form
8. ⚠️ Get auth error (expected)
9. ✅ Close modal

## 📊 Success Criteria

- [x] Page loads without errors
- [x] Services fetch from backend
- [x] Modal opens and closes
- [x] Form validates correctly
- [x] Design matches golden ratio
- [x] Bilingual support works
- [ ] Can book with authentication
- [ ] Booking saves to database

## 🔗 Quick Links

- Services (FR): http://localhost:3000/fr/services
- Services (AR): http://localhost:3000/ar/services
- Backend API: http://localhost:3001/api/v1
- API Docs: http://localhost:3001/api-docs (if available)

## 📞 Need Help?

Check these docs:
1. `IMPLEMENTATION_GUIDE.md` - Complete implementation details
2. `SERVICE_REDESIGN.md` - Design system and architecture
3. Backend API documentation

---

**Ready?** Start both servers and navigate to http://localhost:3000/fr/services 🚀

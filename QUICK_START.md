# 🚀 Quick Start - Admin Dashboard

## ✅ Migration Complete!

Your admin dashboard has been successfully consolidated and is ready to use.

---

## Start Your Application (2 Simple Steps)

### Step 1: Start Backend
```bash
cd backend
npm run dev
```
Backend will run on **http://localhost:3001**

### Step 2: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```
Frontend will run on **http://localhost:3000**

---

## Access Admin Panel

1. **Open your browser**: http://localhost:3000/admin/login

2. **Login with admin credentials**:
   ```
   Email: admin@mjchauffage.com
   Password: [Your admin password]
   ```

3. **If you don't have an admin user yet**:
   ```bash
   cd backend
   npx prisma studio
   # Create a user with role: ADMIN or SUPER_ADMIN
   ```

---

## What You Can Do Now

### ✅ Manage Products
**URL**: http://localhost:3000/admin/products

- Add new products with images
- Edit existing products
- Update stock levels
- Set prices and categories
- **Changes appear instantly on your website!**

### ✅ Manage Orders  
**URL**: http://localhost:3000/admin/orders

- View all customer orders
- Update order status
- Add tracking numbers
- View order details

### ✅ View Customers
**URL**: http://localhost:3000/admin/customers

- See all customers
- Search customers
- View order history
- Manage customer data

### ✅ View Analytics
**URL**: http://localhost:3000/admin/analytics

- Sales performance
- Revenue tracking
- Customer insights

---

## ✨ What Changed?

### Before
- **3 servers** to run (Frontend, Backend, Admin-v2 Backend)
- **2 databases** (data not synced)
- Admin at `http://localhost:3002`

### Now
- **2 servers** to run (Frontend, Backend)
- **1 database** (everything synced)
- Admin at `http://localhost:3000/admin`

---

## 🧪 Quick Test

1. **Test Products Sync**:
   - Create a product in admin panel
   - Go to main website: http://localhost:3000
   - Your new product should appear immediately! ✨

2. **Test Orders**:
   - Place an order on website
   - Check admin panel orders
   - Order appears instantly! ✨

---

## 📚 Documentation

- **Full Setup Guide**: `ADMIN_SETUP_GUIDE.md`
- **Migration Details**: `ADMIN_MIGRATION_SUMMARY.md`
- **This Guide**: `QUICK_START.md`

---

## ❓ Troubleshooting

### Can't login?
- Check backend is running on port 3001
- Verify you have an admin user in database
- Check browser console for errors

### Products don't appear?
- Ensure product `isActive` is `true`
- Check product has a category
- Refresh your browser

### 401 Errors?
- Re-login to get new token
- Check localStorage has `authToken`

---

## 🎯 Next Steps

1. **Test all features** using the checklist in `ADMIN_SETUP_GUIDE.md`
2. **Create some test products** to see the sync in action
3. **Explore the admin panel** - everything is ready!
4. **Optional**: Remove the old `admin-v2/` folder (no longer needed)

---

## 🎉 You're All Set!

Your admin dashboard is now:
- ✅ Fully integrated
- ✅ Synced with main website
- ✅ Simpler to deploy
- ✅ Easier to maintain
- ✅ Ready for production

**Enjoy your new unified admin system!** 🚀

---

Need help? Check `ADMIN_SETUP_GUIDE.md` for detailed troubleshooting.




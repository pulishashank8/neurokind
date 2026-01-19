# NeuroKind - Vercel Quick Deploy Guide

## 🎯 You're Here Because You Ran `vercel` Interactively

### Just Answer These Questions:

```
? Set up and deploy "~\neurokind\web"? 
→ YES (press Enter)

? Which scope should contain your project?
→ pulishashank8's projects (press Enter)

? Link to existing project? 
→ N (type N, press Enter)

? What's your project's name?
→ neurokind (type neurokind, press Enter)

? In which directory is your code located?
→ ./ (press Enter - already in web folder)

? Want to override the settings?
→ N (type N, press Enter)
```

Then Vercel will build and deploy!

---

## ⚠️ Important: After First Deploy

### You Need Environment Variables

Your app won't work yet because it needs:
1. Database connection
2. Auth secrets

---

## 📋 Complete Setup (Copy-Paste These Commands)

### 1. Get Your Vercel URL

After deployment completes, you'll see:
```
✅ Deployment ready [1s]
   https://neurokind-xxxxx.vercel.app
```

**Copy that URL!**

---

### 2. Setup Supabase Database (Free)

```powershell
# Open Supabase
Start-Process "https://supabase.com"

# 1. Sign up / Login
# 2. Click "New Project"
# 3. Name: neurokind
# 4. Create strong password
# 5. Region: closest to you
# 6. Wait 2 minutes...
# 7. Go to Settings → Database
# 8. Copy "Connection String" (URI format)
# 9. Replace [YOUR-PASSWORD] with your actual password
```

---

### 3. Generate Secrets

```powershell
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Copy the output - you'll need it next
```

---

### 4. Add Environment Variables to Vercel

```powershell
cd C:\Users\User\neurokind\web

# Add DATABASE_URL
vercel env add DATABASE_URL
# Paste your Supabase connection string
# Select: Production, Preview, Development (type 1,2,3)

# Add NEXTAUTH_URL  
vercel env add NEXTAUTH_URL
# Enter: https://neurokind-xxxxx.vercel.app (your actual URL)
# Select: Production (type 1)

# Add NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET
# Paste the generated secret from step 3
# Select: Production, Preview, Development (type 1,2,3)
```

---

### 5. Run Database Migration

```powershell
# Create .env.local for migration
$DatabaseUrl = Read-Host "Paste your Supabase DATABASE_URL"
"DATABASE_URL=$DatabaseUrl" | Out-File -FilePath .env.local -Encoding utf8

# Run migration
npx prisma migrate deploy

# Seed database
npm run db:seed

# Delete .env.local (has your password!)
Remove-Item .env.local
```

---

### 6. Deploy to Production

```powershell
vercel --prod
```

---

## ✅ Test Your Deployment

```powershell
# Open your app
Start-Process "https://neurokind-xxxxx.vercel.app"

# Login as admin
# Email: admin@neurokind.local
# Password: admin123

# Test:
# - Community posts work
# - Admin console (/admin)
# - Data catalog
```

---

## 🎯 Quick Copy-Paste Full Sequence

After you have Supabase DATABASE_URL:

```powershell
cd C:\Users\User\neurokind\web

# Generate secret
$secret = node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Add env vars (answer prompts)
vercel env add DATABASE_URL
vercel env add NEXTAUTH_URL  
vercel env add NEXTAUTH_SECRET

# Run migration (paste your DATABASE_URL when asked)
$dbUrl = Read-Host "Paste DATABASE_URL"
"DATABASE_URL=$dbUrl" | Out-File .env.local -Encoding utf8
npx prisma migrate deploy
npm run db:seed
Remove-Item .env.local

# Deploy
vercel --prod
```

---

## 🆘 Troubleshooting

**Build fails:**
```powershell
# Check build logs
vercel logs

# Common issues:
# - Missing env vars → Add them with `vercel env add`
# - Database connection → Check DATABASE_URL format
```

**Can't login:**
```powershell
# Update NEXTAUTH_URL to match your actual Vercel URL
vercel env rm NEXTAUTH_URL
vercel env add NEXTAUTH_URL
# Enter your real URL: https://your-app.vercel.app

# Redeploy
vercel --prod
```

**Database errors:**
```powershell
# Make sure you ran migrations
npx prisma migrate deploy

# Make sure you seeded
npm run db:seed
```

---

## 🎉 You're Done!

Your app is now live at: `https://neurokind-xxxxx.vercel.app`

Share the link and start using it!

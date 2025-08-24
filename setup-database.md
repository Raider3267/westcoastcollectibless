# 🗄️ Database Setup Guide

## Option 1: Supabase (Recommended - Free tier)

### 1. Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub (or email)

### 2. Create New Project
1. Click "New Project"
2. Choose your organization
3. Name: `westcoast-collectibles`
4. Database Password: (generate a strong one)
5. Region: Choose closest to your users
6. Click "Create new project"

### 3. Get Database URL
1. Go to Settings → Database
2. Copy the "Connection string" 
3. Replace `[YOUR-PASSWORD]` with your actual password

### 4. Add to Environment Variables

**Local (.env.local):**
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Vercel (Dashboard):**
1. Go to vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add: `DATABASE_URL` = your connection string
5. Check all environments (Production, Preview, Development)

---

## Option 2: Neon (Alternative)

### 1. Create Neon Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project: `westcoast-collectibles`

### 2. Get Connection String
1. Copy the connection string from dashboard
2. Add to environment variables same as above

---

## Next Steps (After choosing a database)

1. **Tell me which option you chose**
2. **Add the DATABASE_URL to both local and Vercel**
3. **I'll run the database migration**
4. **Import your CSV data to the database**
5. **Update the admin APIs to use the database**

---

## Quick Test

After adding DATABASE_URL, run:
```bash
npx prisma db push
```

If successful, you'll see: ✅ Database connection working!
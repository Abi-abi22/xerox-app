# Xerox Shop Setup

## 1. Supabase Configuration

Your `.env.local` has the URL and anon key. **Add your Service Role Key** for uploads and orders to work:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → Your project
2. **Settings** → **API**
3. Copy the **service_role** key (the secret one, not anon)
4. Add to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## 2. Database & Storage

1. **Create `orders` table**: Run `supabase-setup.sql` in the SQL Editor
2. **Create storage bucket**: Storage → New bucket → name: `xerox-files`, Public: Yes
3. **Storage policy**: The API uses service role, so uploads work automatically

## 3. Run the App

```bash
npm run dev
```

- **Customer**: http://localhost:3000
- **Admin**: http://localhost:3000/admin

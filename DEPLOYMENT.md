# Vercel Deployment Notes

## Storage Limitation
This application currently uses in-memory storage (`MemStorage`) which is suitable for development but **will not persist data** in Vercel's serverless environment. Each API function call may receive a fresh instance, leading to data loss.

## For Production Use
To enable data persistence on Vercel, replace `MemStorage` with a hosted database solution:
- **Recommended**: Use the existing Drizzle ORM setup with Neon Database (already configured in package.json)
- **Alternative**: Use Vercel KV store or other hosted solutions

## Build Configuration
- Build command: `vite build` (overridden in vercel.json to bypass broken package.json scripts)
- Output directory: `dist/public`
- API routes: Serverless functions in `/api` folder

## Current Status
- ✅ API routes converted to Vercel serverless functions
- ✅ Frontend configured for static deployment
- ✅ Vercel build configuration fixed with buildCommand override
- ⚠️ **CRITICAL**: Storage persistence issue - MemStorage will not work across serverless function instances
- ⚠️ Local development broken (package.json dev script still references removed Express server)

## Manual Steps Required (Cannot be automated)
1. **For Local Development**: Update package.json scripts:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```

2. **For Production Persistence**: Replace MemStorage with hosted database:
   - Use existing Drizzle ORM setup with Neon Database, or
   - Use Vercel KV store for simple key-value storage
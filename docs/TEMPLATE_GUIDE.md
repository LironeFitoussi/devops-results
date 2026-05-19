# 📖 Template Usage Guide

## 🎯 Using This Template for Your New Project

This guide will help you quickly set up this template for your new application.

## 🚀 Quick Setup Checklist

### 1. Update Project Names
- [ ] Update `name` in `Server/package.json`
- [ ] Update `name` in `Client/package.json`
- [ ] Update "YourApp" in `Header.tsx` and `Footer.tsx`
- [ ] Update page titles in HTML files

### 2. Configure Environment Variables

**Option A: Automated Setup (Recommended)**
- [ ] Run `npm run boot` from the project root
- [ ] This automatically creates `.env` files from `.env.example` templates
- [ ] Edit `Server/.env` and `Client/.env` with your actual values

**Option B: Manual Setup**
- [ ] Copy `.env.example` to `.env` in both Client and Server directories
- [ ] Set up Auth0 account and get credentials
- [ ] Update MongoDB connection string
- [ ] Update CLIENT_URL and VITE_API_URL for your environment

### 3. Customize Branding
- [ ] Replace app name in components
- [ ] Add your logo
- [ ] Update favicon
- [ ] Customize color scheme if needed

### 4. Set Up Your Models
The template includes a User model. To add more:
- [ ] Create new model in `Server/src/models/`
- [ ] Create Zod validation in `Server/src/zod/`
- [ ] Add TypeScript types in `Server/src/types/`
- [ ] Create controllers in `Server/src/controllers/`
- [ ] Create routes in `Server/src/routes/`

## 🏗️ Project Structure Overview

### Frontend Architecture
```
Client/src/
├── components/         # Organized by Atomic Design
│   ├── Atoms/         # Basic UI elements
│   ├── Molecules/     # Simple component combinations
│   ├── Organism/      # Complex components (Header, Footer)
│   └── ui/            # shadcn/ui base components
├── hooks/             # Custom React hooks
├── pages/             # Route pages
├── redux/             # Global state management
│   └── slices/        # Redux slices
├── services/          # API calls
└── types/             # TypeScript types
```

### Backend Architecture
```
Server/src/
├── config/            # Configuration (DB, etc.)
├── controllers/       # Business logic
├── middleware/        # Express middleware (auth, etc.)
├── models/            # Mongoose models
├── routes/            # API routes
├── types/             # TypeScript types
├── utils/             # Helper functions
└── zod/               # Validation schemas
```

## 🔧 Common Customizations

### Adding a New Feature

#### 1. Backend (API)

**Create Model** (`Server/src/models/yourModelModel.ts`):
```typescript
import mongoose, { Schema } from "mongoose";
import type { IYourModelDoc } from "../types";

const yourModelSchema = new Schema<IYourModelDoc>({
  name: { type: String, required: true },
  // ... your fields
}, { 
  timestamps: true 
});

export default mongoose.model<IYourModelDoc>("YourModel", yourModelSchema);
```

**Create Zod Schema** (`Server/src/zod/yourModelZod.ts`):
```typescript
import { z } from "zod";

export const createYourModelSchema = z.object({
  name: z.string().min(1),
  // ... your fields
});

export const updateYourModelSchema = createYourModelSchema.partial();
```

**Create Controller** (`Server/src/controllers/yourModelControllers.ts`):
```typescript
import type { Request, Response } from "express";
import YourModel from "../models/yourModelModel";
import { createYourModelSchema } from "../zod/yourModelZod";
import { AppError } from "../utils/errorHandler";

class YourModelController {
  async create(req: Request, res: Response) {
    const data = createYourModelSchema.parse(req.body);
    const item = await YourModel.create(data);
    res.status(201).json({ success: true, data: item });
  }

  async getAll(_req: Request, res: Response) {
    const items = await YourModel.find();
    res.status(200).json({ success: true, data: items });
  }

  // ... more methods
}

export default YourModelController;
```

**Create Route** (`Server/src/routes/yourModelRoutes.ts`):
```typescript
import { Router } from "express";
import YourModelController from "../controllers/yourModelControllers";
import { asyncHandler } from "../utils/errorHandler";
import { auth0Middleware } from "../middleware/auth0Mdw";

const router = Router();
const controller = new YourModelController();

router.post("/", auth0Middleware, asyncHandler(controller.create.bind(controller)));
router.get("/", asyncHandler(controller.getAll.bind(controller)));

export default router;
```

**Register Route** (`Server/src/server.ts`):
```typescript
import yourModelRoutes from "./routes/yourModelRoutes.js";
// ...
app.use("/api/your-model", yourModelRoutes);
```

#### 2. Frontend (React)

**Create Service** (`Client/src/services/yourModel.ts`):
```typescript
import api from "./api";

export const getYourModels = async () => {
  const { data } = await api.get("/your-model");
  return data;
};

export const createYourModel = async (payload: any) => {
  const { data } = await api.post("/your-model", payload);
  return data;
};
```

**Create Custom Hook** (optional, `Client/src/hooks/useYourModels.ts`):
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getYourModels, createYourModel } from '@/services/yourModel';
import toast from 'react-hot-toast';

export const useYourModels = () => {
  return useQuery({
    queryKey: ['yourModels'],
    queryFn: getYourModels,
  });
};

export const useCreateYourModel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createYourModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yourModels'] });
      toast.success('Created successfully!');
    },
    onError: () => {
      toast.error('Failed to create');
    },
  });
};
```

**Create Page** (`Client/src/pages/YourModelPage.tsx`):
```typescript
import { useYourModels } from '@/hooks/useYourModels';

export default function YourModelPage() {
  const { data, isLoading, error } = useYourModels();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Models</h1>
      {/* Your UI here */}
    </div>
  );
}
```

**Add Route** (`Client/src/config/routesConfig.tsx`):
```typescript
import YourModelPage from "@/pages/YourModelPage";
import { Box } from "lucide-react";

// Add to the routeConfig array:
{
  path: "/your-model",
  name: "Your Model",
  Component: YourModelPage,
  icon: Box,
  showInSidebar: true,
  requireAuth: true,
  requiredRole: undefined,
}
```

### Adding Protected Routes

Use the `requiredRole` field in the route config — `ProtectedRoute` handles the rest automatically:

```typescript
// In Client/src/config/routesConfig.tsx
{
  path: "/admin",
  name: "Admin",
  Component: AdminPage,
  icon: Shield,
  showInSidebar: true,
  requireAuth: true,
  requiredRole: "admin",  // Only users with "admin" role can access
}
```

### Customizing the Design System

The template uses a clean modern design with a blue theme. To customize:

1. **Colors**: Update CSS variables in `Client/src/index.css` for theme colors
2. **Components**: Modify Tailwind classes in atomic design components
3. **Borders**: Adjust `rounded-xl`, `rounded-lg` classes
4. **Animations**: Update Framer Motion props
5. **Typography**: Change font family in `index.css` (currently using Figtree)

See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for complete guidelines.

## 🔐 Auth0 Setup Details

### 1. Create Auth0 Application
- Type: Single Page Application
- Technology: React
- Note the **Client ID** and **Domain**

### 2. Create Auth0 API
- Name: Your API Name
- Identifier: `https://your-api-identifier` (this is your AUDIENCE)
- Enable RBAC if you need role-based permissions

### 3. Configure Application Settings
```
Allowed Callback URLs:
  http://localhost:5173
  https://your-production-url.com

Allowed Logout URLs:
  http://localhost:5173
  https://your-production-url.com

Allowed Web Origins:
  http://localhost:5173
  https://your-production-url.com
```

### 4. Optional: Add User Roles
1. Go to User Management > Roles
2. Create roles (admin, user, etc.)
3. Assign roles to users
4. The role will be available in `userState.role`

## 🚀 Deployment

### Backend (Server)

**Environment Variables for Production:**
```env
NODE_ENV=production
PORT=3000
MONGO_URI=your-production-mongodb-uri
CLIENT_URL=https://your-frontend-url.com
AUTH0_DOMAIN=your-auth0-domain.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
```

**Build:**
```bash
cd Server
npm run build
npm start
```

**Recommended Platforms:**
- Railway.app
- Render.com
- Heroku
- AWS Elastic Beanstalk
- DigitalOcean App Platform

### Frontend (Client)

**Environment Variables for Production:**
```env
VITE_API_URL=https://your-backend-url.com/api
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
```

**Build:**
```bash
cd Client
npm run build
```

The build outputs to `Client/dist/`

**Recommended Platforms:**
- Vercel (recommended for React)
- Netlify
- AWS S3 + CloudFront
- Firebase Hosting

### Update Auth0 URLs
After deployment, add your production URLs to Auth0 Application settings!

## 📝 Best Practices

### Security
- ✅ Never commit `.env` files
- ✅ Use environment variables for all secrets
- ✅ Keep Auth0 credentials secure
- ✅ Implement rate limiting (already included)
- ✅ Validate all inputs with Zod
- ✅ Use HTTPS in production

### Code Organization
- ✅ Follow the atomic design pattern
- ✅ Keep components small and focused
- ✅ Use TypeScript for type safety
- ✅ Write meaningful commit messages
- ✅ Document complex logic

### Performance
- ✅ Use React Query for server state
- ✅ Implement code splitting for large apps
- ✅ Optimize images
- ✅ Use production builds
- ✅ Enable caching headers

## 🐛 Debugging Tips

### Backend Issues
```bash
# Check if server is running
curl http://localhost:3000/health

# Check database connection
curl http://localhost:3000/danger/db-health

# Check logs
npm run dev  # Watch console output
```

### Frontend Issues
```bash
# Check environment variables
console.log(import.meta.env)

# Check API calls in browser DevTools > Network tab

# Check Redux state in Redux DevTools

# Check React Query state in React Query DevTools
```

### Auth0 Issues
- Verify callback URLs match exactly
- Check token expiration
- Verify audience matches between client and server
- Check Auth0 application logs

## 📚 Additional Resources

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Complete design guidelines
- [README.md](README.md) - Main documentation
- [Auth0 React SDK](https://github.com/auth0/auth0-react)
- [TanStack Query](https://tanstack.com/query/latest)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## 💡 Tips

1. **Start Small**: Begin with one feature and expand
2. **Test Locally**: Always test authentication flow locally first
3. **Use DevTools**: Browser and React DevTools are your friends
4. **Read Errors**: Error messages usually tell you exactly what's wrong
5. **Stay Updated**: Keep dependencies updated regularly

## 🎉 You're Ready!

You now have everything you need to build amazing applications with this template. Happy coding! 🚀

---

Need help? Check the main README or open an issue on GitHub.


# Codex Context — Dressfield UI

## Project
Dressfield is a Georgian embroidery e-commerce site.
Repo root: the directory you're in right now.

## Tech stack
- Frontend: `Dressfield.web/` — Next.js 15 + TypeScript, **static export** (`output: 'export'`)
- Tailwind CSS 4, shadcn/ui components in `src/components/ui/`
- State: TanStack Query 5 + Zustand 5
- Language: Georgian only

## Critical constraints
- NO `next/image` — use plain `<img>` tags
- NO SSR, NO API routes, NO middleware
- Any page using `useSearchParams()` must be wrapped in `<Suspense>`
- All data fetching uses axios via `src/lib/api.ts` (JWT interceptor already set up)
- Backend runs at `http://localhost:5000` (dev) / env var `NEXT_PUBLIC_API_URL` (prod)

## Design tokens (already in globals.css)
- Accent: `#7C3AED` → CSS var `--accent`, Tailwind class `text-accent`, `bg-accent`
- Header bg: `#0A0A0A` → `bg-header-bg`
- Footer bg: `#111827` → `bg-footer-bg`
- Background: `#FAFAFA`
- Max container: `max-w-7xl mx-auto px-4`
- Fonts: Inter (headings/UI) + Noto Sans Georgian (body)

## What's already built
- `src/components/ui/logo.tsx` — SVG logo component, use like:
  ```tsx
  import { Logo } from "@/components/ui/logo";
  <Logo className="h-5 w-auto" />          // header size
  <Logo className="h-7 w-auto mx-auto" />  // auth page size
  <Logo className="h-14 sm:h-16 w-auto mx-auto" /> // hero size
  ```
- `src/components/layout/header.tsx` — sticky dark header with Logo, nav, cart icon
- `src/components/layout/footer.tsx` — 3-column dark footer with Logo
- `src/components/layout/mobile-menu.tsx` + `nav-links.tsx`
- `src/app/auth/` — login, register, forgot-password, reset-password pages
- `src/lib/auth.tsx` — `useAuth()` hook: `{ user, login, register, logout, isAdmin }`
- `src/lib/api.ts` — axios instance with JWT + silent refresh
- `src/stores/cart-store.ts` — Zustand cart store (stub)
- shadcn/ui: button, input, label, card, sheet, dropdown-menu, avatar, badge, separator, skeleton

## Backend API (already running at localhost:5000)

### Categories
- `GET /api/categories` — public, active only → `CategoryDto[]`
- `GET /api/categories/admin` — admin only → `CategoryDto[]` (includes inactive)
- `POST /api/categories` — admin, body: `{ name, slug, description?, displayOrder, isActive }`
- `PUT /api/categories/{id}` — admin
- `DELETE /api/categories/{id}` — admin

### Products
- `GET /api/products?categoryId=&search=` — public → `ProductSummaryDto[]`
- `GET /api/products/admin?categoryId=&search=` — admin → `ProductSummaryDto[]`
- `GET /api/products/{id}` — public → `ProductDetailDto`
- `GET /api/products/slug/{slug}` — public → `ProductDetailDto`
- `GET /api/products/admin/{id}` — admin → `ProductDetailDto`
- `POST /api/products` — admin
- `PUT /api/products/{id}` — admin
- `DELETE /api/products/{id}` — admin

### DTO shapes
```ts
type CategoryDto = {
  id: number; name: string; slug: string; description: string | null;
  displayOrder: number; isActive: boolean; productCount: number;
};

type ProductSummaryDto = {
  id: number; categoryId: number; categoryName: string;
  name: string; slug: string; shortDescription: string | null;
  basePrice: number; primaryImageUrl: string | null;
  isActive: boolean; isFeatured: boolean;
};

type ProductDetailDto = {
  id: number; categoryId: number; categoryName: string; categorySlug: string;
  name: string; slug: string; shortDescription: string | null;
  description: string; basePrice: number; sku: string | null;
  isActive: boolean; isFeatured: boolean;
  images: { id: number; imageUrl: string; altText: string | null; sortOrder: number; isPrimary: boolean }[];
  variants: { id: number; name: string; value: string | null; sku: string | null;
               priceAdjustment: number; stockQuantity: number; isActive: boolean }[];
};
```

## What to build next — Phase 2

### Task 1: Public product listing page
File: `src/app/products/page.tsx`
- Fetch from `GET /api/products` using TanStack Query
- Filter sidebar (left, 240px): category checkboxes + sort dropdown (newest / price ↑ / price ↓)
- Product grid (right, 3 cols desktop / 2 tablet / 1 mobile)
- ProductCard component: 4:5 image ratio, category name, product name, price in accent color, "კალათაში დამატება" button
- Show `<Skeleton>` cards while loading
- Featured badge if `isFeatured`
- Pagination: 12 per page, prev/next

### Task 2: Product detail page
File: `src/app/products/[slug]/page.tsx`
- Must use `generateStaticParams()` — fetch all active slugs from API at build time
- Image gallery: main image + thumbnail strip, click thumbnail swaps main
- Product info: breadcrumb, category badge, name (Heading 2), price (violet), short description
- Variant selectors: button-group style grouped by `variant.name` (e.g. "ზომა" / "ფერი")
- Quantity stepper (- 1 +), "კალათაში დამატება" primary button, "ინდივიდუალური შეკვეთა" ghost button
- Full description in accordion below

### Task 3: Admin categories page
File: `src/app/admin/categories/page.tsx`
- Table: name | slug | products count | active toggle | edit/delete actions
- Create/edit in a right-side Sheet (shadcn sheet already available)
- Form fields: name (auto-generates slug, editable), description, display order, active toggle
- Delete shows confirm dialog

### Task 4: Admin products list page
File: `src/app/admin/products/page.tsx`
- Table with search input (debounced) + category filter
- Columns: thumbnail (40px) | name | category | price | active | actions

### Task 5: Admin product create/edit page
Files: `src/app/admin/products/new/page.tsx` + `src/app/admin/products/[id]/edit/page.tsx`
- Section 1: name, slug (auto from name, editable), category select, active + featured toggles
- Section 2: base price (GEL), SKU
- Section 3: short description (textarea, 300 char counter), full description (textarea)
- Section 4: image URL inputs (for now, no file upload — just URL + alt text + sort order + primary flag)
- Section 5: variant rows (name | value | price adjustment | stock | active | delete), inline add
- Sticky save bar at bottom

## Georgian strings reference
- "პროდუქტები" = Products
- "კატეგორიები" = Categories
- "კალათა" = Cart
- "კალათაში დამატება" = Add to Cart
- "ფასი" = Price
- "ზომა" = Size
- "ფერი" = Color
- "შენახვა" = Save
- "წაშლა" = Delete
- "რედაქტირება" = Edit
- "დამატება" = Add
- "გაუქმება" = Cancel
- "დასტური" = Confirm
- "ძებნა" = Search

## File naming conventions
- Pages: `src/app/[route]/page.tsx`
- Components: `src/components/[area]/[component-name].tsx`
- Use `"use client"` only when the component needs hooks or browser APIs
- Commit format: `feat(02-02): description`

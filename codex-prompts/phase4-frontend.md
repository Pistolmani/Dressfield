# Phase 4 Frontend — Cart, Checkout & Order Management

## Context
This is a Next.js static-export app (`output: "export"`).
**No SSR. No ISR. No `next/image`. No middleware. No Next.js API routes.**
All data fetching uses TanStack Query (v5). State management uses Zustand (v5) with `persist`.
UI: Tailwind CSS 4 + shadcn/ui. API base URL: `process.env.NEXT_PUBLIC_API_URL`.
Language: **Georgian only** for all user-facing text.
Design tokens: accent `#7C3AED`, header `#0A0A0A`, background `#FAFAFA`.

The backend is already built. Relevant endpoints:
- `POST /api/orders` — create order (returns `{ orderId, paymentRedirectUrl, paymentAvailable }`)
- `GET /api/orders/my` — authenticated user's orders
- `GET /api/orders/my/{id}` — order detail for user
- `GET /api/orders/admin` — admin: all orders (optional `?status=Pending`)
- `GET /api/orders/admin/{id}` — admin: order detail
- `PUT /api/orders/admin/{id}/status` — admin: update status + notes

## AGENTS.md instruction
Before writing any Next.js code, read `node_modules/next/dist/docs/` as instructed by AGENTS.md. Heed all deprecation notices.

---

## Task 1 — Update `src/stores/cart-store.ts`

The existing store uses `productId: string`. Update it to match the backend:

```typescript
export interface CartItem {
  productId: number;       // number to match backend int
  variantId?: number;      // optional variant
  name: string;            // product name
  variantLabel?: string;   // e.g. "ზომა: M"
  price: number;           // unit price after variant adjustment
  quantity: number;
  imageUrl?: string;
}
```

Keep the `persist` middleware with key `"dressfield-cart"`.
Add a `totalPrice` computed selector: `get().items.reduce((s, i) => s + i.price * i.quantity, 0)`.
Keep all existing methods: `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `totalItems`.
`addItem` should key uniqueness on `productId + (variantId ?? 0)` so the same product with different variants are separate items.

---

## Task 2 — Create `src/types/order.ts`

```typescript
export type OrderStatus =
  | 'Pending'
  | 'AwaitingPayment'
  | 'Paid'
  | 'Processing'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled'
  | 'Refunded';

export const OrderStatusLabels: Record<OrderStatus, string> = {
  Pending:         'მოლოდინში',
  AwaitingPayment: 'გადახდის მოლოდინში',
  Paid:            'გადახდილია',
  Processing:      'მუშავდება',
  Shipped:         'გაგზავნილია',
  Delivered:       'მიღებულია',
  Cancelled:       'გაუქმებულია',
  Refunded:        'დაბრუნებულია',
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  Pending:         'bg-yellow-100 text-yellow-800',
  AwaitingPayment: 'bg-orange-100 text-orange-800',
  Paid:            'bg-green-100 text-green-800',
  Processing:      'bg-blue-100 text-blue-800',
  Shipped:         'bg-indigo-100 text-indigo-800',
  Delivered:       'bg-emerald-100 text-emerald-800',
  Cancelled:       'bg-red-100 text-red-800',
  Refunded:        'bg-gray-100 text-gray-800',
};

export interface OrderItemDto {
  id: number;
  productId: number | null;
  productName: string;
  productSlug: string;
  productImageUrl: string | null;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderSummaryDto {
  id: number;
  userId: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  shippingCity: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderDetailDto {
  id: number;
  userId: string | null;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  shippingCity: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingPostalCode: string | null;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  totalAmount: number;
  customerNotes: string | null;
  adminNotes: string | null;
  bogOrderId: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDto[];
}

export interface CreateOrderRequest {
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  shippingCity: string;
  shippingAddressLine1: string;
  shippingAddressLine2?: string;
  shippingPostalCode?: string;
  customerNotes?: string;
  items: { productId: number; variantId?: number; quantity: number }[];
}

export interface CheckoutResponse {
  orderId: number;
  paymentRedirectUrl: string | null;
  paymentAvailable: boolean;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  adminNotes?: string;
}
```

---

## Task 3 — Create `src/lib/orders.ts`

```typescript
import api from '@/lib/api';
import type {
  CheckoutResponse,
  CreateOrderRequest,
  OrderDetailDto,
  OrderStatus,
  OrderSummaryDto,
  UpdateOrderStatusRequest,
} from '@/types/order';

export async function createOrder(req: CreateOrderRequest): Promise<CheckoutResponse> {
  const { data } = await api.post<CheckoutResponse>('/api/orders', req);
  return data;
}

export async function getMyOrders(): Promise<OrderSummaryDto[]> {
  const { data } = await api.get<OrderSummaryDto[]>('/api/orders/my');
  return data;
}

export async function getMyOrderById(id: number): Promise<OrderDetailDto> {
  const { data } = await api.get<OrderDetailDto>(`/api/orders/my/${id}`);
  return data;
}

export async function getAdminOrders(status?: OrderStatus): Promise<OrderSummaryDto[]> {
  const params = status ? { status } : {};
  const { data } = await api.get<OrderSummaryDto[]>('/api/orders/admin', { params });
  return data;
}

export async function getAdminOrderById(id: number): Promise<OrderDetailDto> {
  const { data } = await api.get<OrderDetailDto>(`/api/orders/admin/${id}`);
  return data;
}

export async function updateOrderStatus(id: number, req: UpdateOrderStatusRequest): Promise<void> {
  await api.put(`/api/orders/admin/${id}/status`, req);
}
```

---

## Task 4 — Create `src/app/cart/page.tsx`

`"use client"` page. Uses `useCartStore`.

Layout (two-column on desktop, stacked on mobile):

**Left column — Cart items list:**
- If cart is empty: centered message "კალათა ცარიელია" with a link "პროდუქტების ნახვა" → `/products`
- Each item row:
  - 64×64px product image (plain `<img>`, fallback gray square if no image)
  - Product name (bold), variant label (small gray text below if present)
  - Unit price formatted as `₾X.XX`
  - Quantity stepper: `−` / number / `+` buttons (min 1, max 99)
  - Remove button (trash icon or ✕)

**Right column — Order summary:**
- "შეკვეთის შეჯამება" heading
- Subtotal row: items × price
- Shipping: "გამოთვლება მიწოდებისას" (Calculated at checkout) shown in gray
- Total row (bold)
- "გადახდაზე გადასვლა" primary button → navigates to `/checkout`
- "საყიდლები გაგრძელება" ghost link → `/products`

Use `useRouter` from `next/navigation` for the checkout button.

---

## Task 5 — Create `src/app/checkout/page.tsx`

`"use client"` page. Two-step flow managed with local `useState<'form' | 'review'>`.

**Step indicator** at top: `1. მიწოდება → 2. განხილვა` — highlight active step.

**Step 1 — Shipping form:**
Fields (all Georgian labels):
- სახელი და გვარი * (`contactName`)
- ტელეფონი * (`contactPhone`)
- ელ-ფოსტა * (`contactEmail`)
- ქალაქი * (`shippingCity`)
- მისამართი * (`shippingAddressLine1`)
- მისამართი 2 (`shippingAddressLine2`, optional)
- საფოსტო ინდექსი (`shippingPostalCode`, optional)
- შენიშვნა (`customerNotes`, optional, textarea)

Use `useState` for form fields. Basic client-side validation: required fields must not be empty, email must contain `@`.

"გაგრძელება" button → advances to step 2.

**Step 2 — Order review:**
- Show all form values in a summary card
- Show cart items (image, name, variant, qty, price) — same style as cart page
- Show subtotal + shipping (₾5.00) + total
- "შეკვეთის გაფორმება" primary button — calls `createOrder()`, shows loading spinner, then:
  - If `paymentRedirectUrl` is set → `window.location.href = paymentRedirectUrl` (redirect to BOG)
  - If not available → `router.push('/order-confirmation?orderId=X&mock=1')`
  - On error → show Georgian error toast/message: "შეკვეთის გაფორმება ვერ მოხერხდა. სცადეთ თავიდან."
- "უკან" button to go back to step 1

Cart must not be empty — if cart is empty on load, redirect to `/cart`.

After successful order submission: call `clearCart()`.

---

## Task 6 — Create `src/app/order-confirmation/page.tsx`

`"use client"` page. Reads `orderId` and `key` from `useSearchParams()` (wrap in Suspense as required for static export).

Show a success screen:
- Large green checkmark icon (or ✓ emoji)
- Heading: "შეკვეთა წარმატებით გაფორმდა!"
- Subtext: "თქვენი შეკვეთის ნომერია #{{orderId}}"
- Body: "გადახდის დადასტურების შემდეგ მიიღებთ დეტალებს."
- Two buttons:
  - "ჩემი შეკვეთები" → `/` (or `/auth/login` if not authenticated — just go to home for simplicity)
  - "მთავარ გვერდზე დაბრუნება" → `/`

If `?mock=1` query param is present, also show a small dev-only notice: "(Dev: mock payment — no real transaction)"

---

## Task 7 — Create `src/app/order-failed/page.tsx`

`"use client"` page. Reads `orderId` from `useSearchParams()` (wrap in Suspense).

Show a failure screen:
- Red ✕ icon
- Heading: "გადახდა ვერ მოხერხდა"
- Subtext: "თქვენი შეკვეთა #{{orderId}} ჯერ არ არის დადასტურებული."
- Body: "სცადეთ თავიდან ან დაგვიკავშირდით."
- Two buttons:
  - "თავიდან სცადეთ" → `/checkout`
  - "მთავარ გვერდზე" → `/`

---

## Task 8 — Create `src/components/admin/orders-manager.tsx`

`"use client"` component. Uses TanStack Query.

**Header row:** "შეკვეთები" title + status filter dropdown (All + each OrderStatus in Georgian).

**Table columns:** # | კონტაქტი | ქალაქი | სტატუსი | ჯამი | პროდუქტები | თარიღი | ქმედება

- Status shown as colored badge using `OrderStatusColors`
- "ქმედება" column: "დეტალები" link → `/admin/orders/detail?id={id}`
- Loading state: single `<tr>` with colSpan=8, centered spinner or "იტვირთება..."
- Error state: single `<tr>` with colSpan=8, red error message
- Empty state: single `<tr>` with colSpan=8, "შეკვეთები არ მოიძებნა"

---

## Task 9 — Create `src/components/admin/order-detail.tsx`

`"use client"` component. Props: `orderId: number`.

Fetches `getAdminOrderById(orderId)` with TanStack Query.

Display:
- Contact info card (name, email, phone)
- Shipping address card
- Order items table (image, name, variant, qty, unit price, line total)
- Financial summary (subtotal, shipping, total)
- Current status badge + `bogOrderId` if present

**Status update form** (below):
- Status dropdown (all OrderStatus values with Georgian labels)
- Admin notes textarea
- "განახლება" button — calls `updateOrderStatus()`, invalidates query on success, shows success toast

---

## Task 10 — Create `src/app/admin/orders/page.tsx`

Simple server-compatible page (no `"use client"` needed at page level):

```typescript
import { Suspense } from 'react';
import OrdersManager from '@/components/admin/orders-manager';

export default function AdminOrdersPage() {
  return (
    <Suspense>
      <OrdersManager />
    </Suspense>
  );
}
```

---

## Task 11 — Create `src/app/admin/orders/detail/page.tsx`

`"use client"` page using `useSearchParams()` for the `id` query param. Wrap in Suspense in the parent export.

Pattern (same as custom-orders/detail):

```typescript
'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderDetail from '@/components/admin/order-detail';

function DetailInner() {
  const params = useSearchParams();
  const id = Number(params.get('id'));
  if (!id) return <p className="p-8 text-red-500">შეკვეთის ID არ არის მითითებული.</p>;
  return <OrderDetail orderId={id} />;
}

export default function AdminOrderDetailPage() {
  return (
    <Suspense>
      <DetailInner />
    </Suspense>
  );
}
```

---

## Task 12 — Wire cart into the product detail page

In `src/app/products/[slug]/page.tsx` (or wherever "Add to Cart" button lives), connect the button to `useCartStore().addItem(...)`.

The button should:
1. Build a `CartItem` from the product data + selected variant
2. Call `addItem()`
3. Show brief feedback: change button text to "✓ დამატებულია" for 1.5 seconds then reset

Also add a cart icon in the site header/nav that shows item count badge. The header component is likely in `src/components/layout/` or `src/app/layout.tsx` — find it and add a cart icon (use a simple shopping bag SVG or lucide-react `ShoppingCart` icon) with a count badge from `useCartStore(s => s.totalItems())`.

---

## Quality Requirements

- All user-facing text must be in **Georgian**
- No TypeScript errors (`tsc --noEmit` must pass)
- No `next/image` — use plain `<img>` tags
- All `"use client"` pages that use `useSearchParams()` must be wrapped in `<Suspense>`
- Format prices as `₾X.XX` (Georgian Lari symbol)
- The cart must persist across page reloads (already handled by Zustand persist)
- Do NOT use `getServerSideProps` or `getStaticProps` — this is the App Router
- Import `useRouter` from `next/navigation`, NOT `next/router`

## After completing all tasks

Run `npx tsc --noEmit` from the `Dressfield.web` directory. Fix any TypeScript errors before finishing.

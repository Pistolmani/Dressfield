# Codex Prompt — Phase 3 Frontend: Custom Design Order Flow (Plans 3–6)

## Project root
`C:\Users\piros\OneDrive\Desktop\Dressfield\Dressfield.web`

---

## Hard constraints — read before writing a single line

1. **Static export** — `output: 'export'` in next.config. No SSR, no ISR, no Next.js API routes, no middleware, no `next/image`, no server components with async data fetching in client pages.
2. Every interactive page is `"use client"`. Pages that need data use TanStack Query.
3. Use plain `<img>` everywhere — never `next/image`.
4. All user-visible text is **Georgian only** — no English in UI strings.
5. Follow existing patterns exactly — do not invent new patterns.
6. Accent color: `#7C3AED`. Use `bg-accent`, `text-accent`, `border-accent`, `hover:bg-accent-hover` (Tailwind tokens already defined in globals.css).
7. Rounded corners on cards: `rounded-3xl`. Borders: `border border-black/8`. Shadows: `shadow-sm`.
8. Max container: `max-w-7xl mx-auto px-4`.
9. Font headings: `font-[family-name:var(--font-inter)]`.

---

## What already exists (DO NOT recreate)

```
src/lib/api.ts           — axios instance (base URL from NEXT_PUBLIC_API_URL)
src/lib/upload.ts        — uploadDesignImage(file), validateDesignFile(), UploadValidationError
src/lib/catalog.ts       — getStaticProducts(), getProducts(), formatPrice(), etc.
src/lib/auth.tsx         — useAuth() hook
src/types/catalog.ts     — ProductSummaryDto, ProductDetailDto, etc.
src/stores/cart-store.ts — Zustand store example (use as pattern)
src/components/ui/       — button, input, label, badge, skeleton, sheet, card, logo
src/components/catalog/product-card.tsx — card pattern to reference
```

---

## Install first

```bash
cd Dressfield.web
npm install fabric@5
npm install @types/fabric --save-dev
```

fabric v5 (NOT v6 — API is different).

---

## API endpoints (backend is ready)

### Upload design image
```
POST /api/upload/design
Content-Type: multipart/form-data
Body: file (File)
Response: { url: string }
```
Already wrapped in `src/lib/upload.ts` as `uploadDesignImage(file)`.

### Get products (for product picker)
```
GET /api/products
Response: ProductSummaryDto[]  (already typed in src/types/catalog.ts)
```
Already wrapped in `src/lib/catalog.ts` as `getProducts()`.

### Submit custom order
```
POST /api/custom-orders
Body: {
  baseProductId: number | null,
  contactName: string,
  contactPhone: string,
  contactEmail: string,
  totalPrice: number,
  customerNotes: string | null,
  designs: [{
    designImageUrl: string,
    placement: string | null,   // "chest" | "back" | "sleeve" | "full-front"
    size: string | null,         // "S" | "M" | "L" | "XL"
    threadColor: string | null,  // hex e.g. "#7C3AED"
    width: number | null,        // cm
    height: number | null,       // cm
    positionX: number | null,    // %
    positionY: number | null,    // %
    sortOrder: number
  }]
}
Response: CustomOrderDetailDto
```

### Admin — list custom orders
```
GET /api/custom-orders/admin?status=0   (status is optional, 0=Pending)
Response: CustomOrderSummaryDto[]
```

### Admin — get one custom order
```
GET /api/custom-orders/admin/{id}
Response: CustomOrderDetailDto
```

### Admin — update status
```
PUT /api/custom-orders/admin/{id}/status
Body: { status: number, adminNotes: string | null }
Response: 204 No Content
```

Status enum values:
```
0 = Pending     (მოლოდინში)
1 = Reviewing   (განხილვაში)
2 = Approved    (დამტკიცებულია)
3 = InProduction (წარმოებაში)
4 = Completed   (დასრულებულია)
5 = Rejected    (უარყოფილია)
6 = Cancelled   (გაუქმებულია)
```

---

## TypeScript types to add

Create `src/types/custom-order.ts`:

```typescript
export type CustomOrderStatus = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const CustomOrderStatusLabels: Record<CustomOrderStatus, string> = {
  0: "მოლოდინში",
  1: "განხილვაში",
  2: "დამტკიცებულია",
  3: "წარმოებაში",
  4: "დასრულებულია",
  5: "უარყოფილია",
  6: "გაუქმებულია",
};

export interface CustomOrderDesignDto {
  id: number;
  designImageUrl: string;
  placement: string | null;
  size: string | null;
  threadColor: string | null;
  width: number | null;
  height: number | null;
  positionX: number | null;
  positionY: number | null;
  sortOrder: number;
}

export interface CustomOrderSummaryDto {
  id: number;
  userId: string | null;
  baseProductId: number | null;
  baseProductName: string | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: CustomOrderStatus;
  totalPrice: number;
  createdAt: string;
}

export interface CustomOrderDetailDto extends CustomOrderSummaryDto {
  customerNotes: string | null;
  adminNotes: string | null;
  updatedAt: string;
  designs: CustomOrderDesignDto[];
}

export interface CreateCustomOrderDesignRequest {
  designImageUrl: string;
  placement: string | null;
  size: string | null;
  threadColor: string | null;
  width: number | null;
  height: number | null;
  positionX: number | null;
  positionY: number | null;
  sortOrder: number;
}

export interface CreateCustomOrderRequest {
  baseProductId: number | null;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  totalPrice: number;
  customerNotes: string | null;
  designs: CreateCustomOrderDesignRequest[];
}
```

Also add API functions to a new file `src/lib/custom-orders.ts`:

```typescript
import api from "@/lib/api";
import type {
  CreateCustomOrderRequest,
  CustomOrderDetailDto,
  CustomOrderSummaryDto,
  CustomOrderStatus,
} from "@/types/custom-order";

export const PLACEMENT_OPTIONS = [
  { value: "chest", label: "გულმკერდი" },
  { value: "back", label: "ზურგი" },
  { value: "sleeve", label: "სახელო" },
  { value: "full-front", label: "სრული წინა" },
] as const;

export const SIZE_OPTIONS = [
  { value: "S", label: "S", priceAdj: 0 },
  { value: "M", label: "M", priceAdj: 0 },
  { value: "L", label: "L", priceAdj: 5 },
  { value: "XL", label: "XL", priceAdj: 10 },
] as const;

export const THREAD_COLOR_OPTIONS = [
  { value: "#7C3AED", label: "იისფერი" },
  { value: "#DC2626", label: "წითელი" },
  { value: "#16A34A", label: "მწვანე" },
  { value: "#2563EB", label: "ლურჯი" },
  { value: "#F59E0B", label: "ოქროსფერი" },
  { value: "#000000", label: "შავი" },
  { value: "#FFFFFF", label: "თეთრი" },
] as const;

export const BASE_CUSTOM_PRICE = 45; // GEL

export async function submitCustomOrder(
  payload: CreateCustomOrderRequest
): Promise<CustomOrderDetailDto> {
  const { data } = await api.post<CustomOrderDetailDto>("/api/custom-orders", payload);
  return data;
}

export async function getAdminCustomOrders(
  status?: CustomOrderStatus
): Promise<CustomOrderSummaryDto[]> {
  const { data } = await api.get<CustomOrderSummaryDto[]>("/api/custom-orders/admin", {
    params: status !== undefined ? { status } : {},
  });
  return data;
}

export async function getAdminCustomOrderById(
  id: number
): Promise<CustomOrderDetailDto> {
  const { data } = await api.get<CustomOrderDetailDto>(`/api/custom-orders/admin/${id}`);
  return data;
}

export async function updateCustomOrderStatus(
  id: number,
  status: CustomOrderStatus,
  adminNotes: string | null
): Promise<void> {
  await api.put(`/api/custom-orders/admin/${id}/status`, { status, adminNotes });
}
```

---

## Zustand store for wizard state

Create `src/stores/custom-order-store.ts`:

```typescript
import { create } from "zustand";
import type { ProductSummaryDto } from "@/types/catalog";

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface DesignConfig {
  designImageUrl: string;   // URL returned by /api/upload/design
  previewDataUrl: string;   // local object URL for canvas preview (not sent to server)
  placement: string;
  size: string;
  threadColor: string;
  width: number | null;
  height: number | null;
  positionX: number | null;
  positionY: number | null;
}

export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

interface CustomOrderState {
  step: WizardStep;
  selectedProduct: ProductSummaryDto | null;
  uploadedFile: File | null;
  design: DesignConfig | null;
  contact: ContactInfo;
  totalPrice: number;

  setStep: (step: WizardStep) => void;
  setSelectedProduct: (product: ProductSummaryDto | null) => void;
  setUploadedFile: (file: File | null) => void;
  setDesign: (design: DesignConfig) => void;
  setContact: (contact: Partial<ContactInfo>) => void;
  setTotalPrice: (price: number) => void;
  reset: () => void;
}

const defaultContact: ContactInfo = { name: "", phone: "", email: "", notes: "" };

export const useCustomOrderStore = create<CustomOrderState>((set) => ({
  step: 1,
  selectedProduct: null,
  uploadedFile: null,
  design: null,
  contact: defaultContact,
  totalPrice: 45,

  setStep: (step) => set({ step }),
  setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
  setUploadedFile: (uploadedFile) => set({ uploadedFile }),
  setDesign: (design) => set({ design }),
  setContact: (contact) => set((state) => ({ contact: { ...state.contact, ...contact } })),
  setTotalPrice: (totalPrice) => set({ totalPrice }),
  reset: () =>
    set({ step: 1, selectedProduct: null, uploadedFile: null, design: null, contact: defaultContact, totalPrice: 45 }),
}));
```

---

## Plan 3 — Pages and Steps 1–2

### `src/components/custom-order/step-indicator.tsx`
Progress bar at the top. 5 steps (skip step numbering details — just show step N of 5).

```
Step 1: პროდუქტი    Step 2: ატვირთვა    Step 3: რედაქტირება    Step 4: პარამეტრები    Step 5: გადახედვა    Step 6: შეკვეთა
```

Props: `{ currentStep: WizardStep }`.

Style: horizontal row of numbered circles connected by lines. Active = `bg-accent text-white`. Done = `bg-accent/20 text-accent`. Upcoming = `bg-black/5 text-muted-foreground`. Connector line: `bg-accent` for done segments, `bg-black/8` for upcoming.

### `src/app/custom-order/page.tsx`
`"use client"` page. Renders the correct step component based on `useCustomOrderStore(s => s.step)`.

```tsx
// Route: /custom-order
export default function CustomOrderPage() {
  // read step from store
  // render: <StepIndicator currentStep={step} />
  // then switch on step:
  //   1 → <ProductPickerStep />
  //   2 → <UploadStep />
  //   3 → <CanvasEditorStep />
  //   4 → <OptionsStep />
  //   5 → <MockupPreviewStep />
  //   6 → <ContactStep />
}
```

Wrap in `max-w-4xl mx-auto px-4 py-10` container.

### `src/components/custom-order/product-picker-step.tsx`
Step 1. Fetches products from `/api/products` using TanStack Query (`getProducts()`).

Layout:
- Heading: "აირჩიეთ საბაზო პროდუქტი" (subtitle: "ან გამოტოვეთ ცარიელი ტილოს შესაქმნელად")
- Grid of product cards: 2 cols mobile / 3 cols desktop
- Each card: product image (4:5), name, price — clicking selects it (violet border highlight)
- Special "ცარიელი ტილო" (blank canvas) card as the first option — a dashed border card with an icon
- "გაგრძელება" button at bottom → `setSelectedProduct(selected)` then `setStep(2)`
- Loading: show 6 skeleton cards
- Error: Georgian error message

Selected card: `ring-2 ring-accent ring-offset-2`

### `src/components/custom-order/upload-step.tsx`
Step 2. Uses `react-dropzone`.

Layout:
- Back button (← უკან) top left → `setStep(1)`
- Large drop zone: dashed border `border-2 border-dashed border-black/20`, rounded-3xl, center content
  - Upload icon
  - "ჩააგდეთ ფაილი აქ ან დააჭირეთ ასარჩევად"
  - Sub: "JPG, PNG, WebP — მაქსიმუმ 10 MB"
- On file drop/select: call `validateDesignFile(file)` from `src/lib/upload.ts`
  - If error: show Georgian error message below dropzone (red text)
  - If valid: show preview thumbnail (object URL), file name, file size
- Show "ატვირთვა და გაგრძელება" button once file is selected
  - On click: call `uploadDesignImage(file)` (shows loading spinner on button)
  - On success: `setUploadedFile(file)`, `setDesign({ designImageUrl: url, previewDataUrl: objectUrl, placement: "chest", size: "M", threadColor: "#7C3AED", width: null, height: null, positionX: null, positionY: null })`, `setStep(3)`
  - On error: show "ატვირთვა ვერ მოხერხდა" error message

---

## Plan 4 — Steps 3–4

### `src/components/custom-order/canvas-editor-step.tsx`
Step 3. The fabric.js canvas editor.

**CRITICAL fabric.js v5 usage:**
```typescript
// Dynamic import REQUIRED — fabric.js uses window, can't SSR
const [fabricModule, setFabricModule] = useState<typeof import("fabric") | null>(null);
useEffect(() => {
  import("fabric").then(setFabricModule);
}, []);
```

Layout:
- Back button top left → `setStep(2)`
- Canvas area: 500×500px `<canvas ref={canvasRef} />` in a white rounded-3xl container
- Controls below canvas:
  - "გადაადგილება/ზომა: გამოიყენეთ სახელურები" helper text
  - Two buttons: "↺ ბრუნვა -15°" | "↻ ბრუნვა +15°"
  - "გაგრძელება" button → saves position/size from fabric object → `setDesign(...)` → `setStep(4)`

**Canvas setup (in useEffect after fabricModule loads):**
```typescript
// 1. Create canvas
const canvas = new fabricModule.fabric.Canvas(canvasRef.current, { width: 500, height: 500 });

// 2. If selectedProduct has a primaryImageUrl, load it as a non-selectable background image
//    Use fabricModule.fabric.Image.fromURL(url, (img) => { img.set({ selectable: false, evented: false }); canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), { scaleX: canvas.width / img.width, scaleY: canvas.height / img.height }); })
//    If no product image, fill background with #f3f4f6

// 3. Load the design image from design.previewDataUrl
//    fabricModule.fabric.Image.fromURL(design.previewDataUrl, (img) => {
//      img.set({ left: 150, top: 150, scaleX: 200 / img.width, scaleY: 200 / img.height });
//      canvas.add(img);
//      canvas.setActiveObject(img);
//      canvas.renderAll();
//    }, { crossOrigin: "anonymous" });

// 4. On "continue": read active object position
//    const obj = canvas.getActiveObject();
//    if (obj) {
//      setDesign({
//        ...design,
//        positionX: Math.round((obj.left / canvas.width) * 100),
//        positionY: Math.round((obj.top / canvas.height) * 100),
//        width: Math.round(obj.getScaledWidth() / canvas.width * 100),   // store as % of canvas
//        height: Math.round(obj.getScaledHeight() / canvas.height * 100),
//      });
//    }
//    setStep(4);
```

Clean up canvas on unmount: `canvas.dispose()`.

### `src/components/custom-order/options-step.tsx`
Step 4. User picks placement, size, thread color.

Layout:
- Back button → `setStep(3)`
- Three sections, each in a white rounded-3xl border card:

**Section 1 — განთავსება (Placement)**
Button group from `PLACEMENT_OPTIONS` in `src/lib/custom-orders.ts`.
Selected = `bg-accent text-white`, others = `border border-black/8 bg-white hover:border-accent/40`.

**Section 2 — ზომა (Size)**
Button group from `SIZE_OPTIONS`. Show price adjustment if > 0: "+5 ₾".

**Section 3 — ძაფის ფერი (Thread Color)**
Color swatches — 40×40px circles from `THREAD_COLOR_OPTIONS`.
Selected: ring-2 ring-accent ring-offset-2. White swatch needs a border.

**Price summary:**
```
საბაზო ფასი:          45 ₾
ზომის დამატება:       +5 ₾ (if applicable)
სულ:                  50 ₾
```

"გაგრძელება" button → `setDesign({ ...design, placement, size, threadColor })` → `setTotalPrice(total)` → `setStep(5)`

---

## Plan 5 — Steps 5–6

### `src/components/custom-order/mockup-preview-step.tsx`
Step 5. Shows the customer what their order will look like.

Layout:
- Back button → `setStep(4)`
- Left side (or top on mobile): the canvas as a static image
  - Render a NEW fabric.js canvas (same as step 3 but non-interactive) OR just use a `<canvas>` rendered once
  - Product background + design overlay positioned using the saved `positionX`, `positionY`, `width`, `height` from store
  - Show as a static preview — no drag/resize
- Right side (or below on mobile): order summary card
  - Product name or "ცარიელი ტილო"
  - Placement, Size, Thread color (with color swatch)
  - Total price (large, accent color)
- "შეკვეთის გაფორმება" button → `setStep(6)`

**Canvas rendering for static preview:**
Use a `<canvas>` element with fabric.js but set `selection: false` and all objects `selectable: false`. Same load logic as step 3.

### `src/components/custom-order/contact-step.tsx`
Step 6. Contact info + submission.

Layout:
- Back button → `setStep(5)`
- Heading: "შეკვეთის გაფორმება"
- Form fields (use existing `<Input>` + `<Label>` components):
  - სახელი და გვარი (required)
  - ტელეფონი (required, placeholder "+995 5XX XXX XXX")
  - ელ-ფოსტა (required)
  - შენიშვნა (optional, textarea)
- Order summary mini-card: product name, size, placement, total price
- "შეკვეთის გაგზავნა" submit button (full width, accent)

On submit:
1. Validate fields — show inline Georgian errors if empty
2. Call `submitCustomOrder({ baseProductId: selectedProduct?.id ?? null, contactName, contactPhone, contactEmail, totalPrice, customerNotes: notes || null, designs: [{ designImageUrl: design.designImageUrl, placement: design.placement, size: design.size, threadColor: design.threadColor, width: design.width, height: design.height, positionX: design.positionX, positionY: design.positionY, sortOrder: 0 }] })`
3. On success: show success state (no redirect needed):
   - Green checkmark icon
   - "შეკვეთა გაიგზავნა!" heading
   - "მალე დაგიკავშირდებით" sub-text
   - "ახალი შეკვეთა" button → `reset()` → `setStep(1)` → scroll to top
4. On error: "შეკვეთის გაგზავნა ვერ მოხერხდა. სცადეთ ხელახლა." toast (use sonner `toast.error`)

---

## Plan 6 — Admin Custom Orders

### `src/app/admin/custom-orders/page.tsx`
```tsx
"use client";
import { CustomOrdersManager } from "@/components/admin/custom-orders-manager";
export default function AdminCustomOrdersPage() {
  return <CustomOrdersManager />;
}
```

### `src/app/admin/custom-orders/[id]/page.tsx`

**STATIC EXPORT PROBLEM:** Dynamic routes need `generateStaticParams` OR query-string pattern.
Use query-string pattern (same as admin product edit):

```
/admin/custom-orders/detail?id=5
```

So create: `src/app/admin/custom-orders/detail/page.tsx` (query-string based, `useSearchParams()` in `<Suspense>`).

### `src/components/admin/custom-orders-manager.tsx`

Table with columns: ID | სახელი | ელ-ფოსტა | პროდუქტი | ფასი | სტატუსი | თარიღი | ჩვენება

- Status filter dropdown at top (all, pending, reviewing, etc.)
- Status badge component (colored):
  - Pending: yellow/amber
  - Reviewing: blue
  - Approved: green
  - InProduction: purple (accent)
  - Completed: green dark
  - Rejected: red
  - Cancelled: gray
- "ჩვენება" (View) button → link to `/admin/custom-orders/detail?id={order.id}`
- Loading/empty/error states (same pattern as products-manager.tsx)
- Uses `getAdminCustomOrders(status?)` from `src/lib/custom-orders.ts`

### `src/components/admin/custom-order-detail.tsx`

Full detail view. Shows:
- Back link to `/admin/custom-orders`
- Order ID, contact info, timestamps
- Design images: each `design.designImageUrl` shown as a 200×200 `<img>` with rounded corners
- Options: placement, size, thread color (color swatch inline)
- Customer notes (if any)
- **Status update section** (right side or bottom card):
  - Current status badge
  - Status dropdown (`<select>`)
  - Admin notes textarea
  - "სტატუსის განახლება" button → calls `updateCustomOrderStatus(id, status, notes)`
  - Uses `useMutation` from TanStack Query, invalidates `["admin-custom-orders"]` on success
  - Toast success/error with Georgian messages

Uses `getAdminCustomOrderById(id)` query.

---

## File structure to create

```
src/types/custom-order.ts
src/lib/custom-orders.ts
src/stores/custom-order-store.ts
src/components/custom-order/step-indicator.tsx
src/components/custom-order/product-picker-step.tsx
src/components/custom-order/upload-step.tsx
src/components/custom-order/canvas-editor-step.tsx
src/components/custom-order/options-step.tsx
src/components/custom-order/mockup-preview-step.tsx
src/components/custom-order/contact-step.tsx
src/app/custom-order/page.tsx
src/components/admin/custom-orders-manager.tsx
src/components/admin/custom-order-detail.tsx
src/app/admin/custom-orders/page.tsx
src/app/admin/custom-orders/detail/page.tsx
```

---

## After writing all files

Run:
```bash
npx tsc --noEmit
```

Fix any TypeScript errors. Then commit:
```
feat(03-03-06): custom order frontend — wizard, canvas, admin review
```

---

## Common mistakes to avoid

1. **Never use `fabric.Canvas` without dynamic import** — it will crash on SSR/build. Always `import("fabric")` inside `useEffect`.
2. **Never use `next/image`** — always plain `<img>`.
3. **Never create dynamic routes** like `/admin/custom-orders/[id]/page.tsx` — use query-string pattern instead (`/admin/custom-orders/detail/page.tsx` with `useSearchParams()` wrapped in `<Suspense>`).
4. **Canvas cleanup** — always call `canvas.dispose()` in the `useEffect` cleanup function to prevent memory leaks.
5. **Object URLs** — call `URL.revokeObjectURL()` in cleanup when creating object URLs from File objects.
6. **Georgian strings only** — no English in any UI text.
7. **Import `toast` from `"sonner"`** — already installed.
8. **Use existing Button component** from `@/components/ui/button`, not native `<button>` for primary actions.

---
phase: 1
slug: foundation-scaffolding
status: approved
shadcn_initialized: false
preset: none
created: 2026-03-27
---

# Phase 1 — UI Design Contract

> Visual and interaction contract for the foundation layout shell: header, footer, navigation, auth pages, responsive grid. All Phase 1 UI components must follow this spec.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui |
| Preset | not applicable (custom theme) |
| Component library | Radix UI (via shadcn) |
| Icon library | Lucide React |
| Font (headings) | Inter (700, 800) |
| Font (body) | Inter (400, 500) |
| Font (Georgian) | Noto Sans Georgian (400, 700) |

**Font loading strategy:** Use `next/font/google` for Inter and Noto Sans Georgian. Georgian font is primary for all customer-facing text. Inter for UI labels, numbers, and English fallback. Load only weights used (400, 500, 700, 800).

---

## Spacing Scale

Declared values (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Compact element spacing, input padding |
| md | 16px | Default element spacing, card padding |
| lg | 24px | Section padding, form group spacing |
| xl | 32px | Layout gaps between major sections |
| 2xl | 48px | Hero padding, major section breaks |
| 3xl | 64px | Page-level vertical spacing |
| 4xl | 96px | Hero section height padding |

Exceptions: none

---

## Typography

| Role | Size | Weight | Line Height | Font |
|------|------|--------|-------------|------|
| Body | 16px | 400 | 1.6 | Noto Sans Georgian / Inter |
| Body Small | 14px | 400 | 1.5 | Noto Sans Georgian / Inter |
| Label | 14px | 500 | 1.4 | Inter |
| Heading 1 | 36px | 800 | 1.2 | Inter |
| Heading 2 | 28px | 700 | 1.3 | Inter |
| Heading 3 | 22px | 700 | 1.3 | Inter |
| Display | 48px | 800 | 1.1 | Inter |
| Nav Link | 15px | 500 | 1.4 | Inter |
| Button | 15px | 600 | 1.0 | Inter |
| Price | 20px | 700 | 1.2 | Inter (tabular-nums) |
| Caption | 12px | 400 | 1.4 | Inter |

**Georgian text note:** Noto Sans Georgian has taller ascenders/descenders than Inter. Set `line-height: 1.6` minimum for Georgian body text. Test all UI components with Georgian strings (not English placeholders).

---

## Color

| Role | Value | Usage |
|------|-------|-------|
| Background (60%) | `#FAFAFA` | Page background |
| Surface | `#FFFFFF` | Cards, modals, dropdowns |
| Primary / Text | `#0A0A0A` | Headings, body text, header bar |
| Secondary Text | `#6B7280` | Captions, placeholders, muted text |
| Border | `#E5E7EB` | Card borders, dividers, input borders |
| Accent (10%) | `#7C3AED` | CTAs, active states, links |
| Accent Hover | `#6D28D9` | Button hover, link hover |
| Accent Light | `#EDE9FE` | Accent backgrounds, badges, tags |
| Accent Foreground | `#FFFFFF` | Text on accent buttons |
| Destructive | `#EF4444` | Delete actions, error states |
| Destructive Light | `#FEF2F2` | Error backgrounds |
| Success | `#10B981` | Order confirmed, payment success |
| Success Light | `#ECFDF5` | Success backgrounds |
| Warning | `#F59E0B` | Pending states, caution messages |
| Header BG | `#0A0A0A` | Header bar (black, matches logo) |
| Header Text | `#FFFFFF` | Header text and logo (white on black) |
| Footer BG | `#111827` | Footer (dark gray, slightly lighter than header) |
| Footer Text | `#D1D5DB` | Footer links and text |

**Accent reserved for:** Primary CTA buttons, active nav indicators, links, cart badge count, price highlights, form focus rings. Never on large background areas.

**Dark header rationale:** Logo is white on black — header matches logo identity. Creates strong brand recognition and visual hierarchy.

---

## Layout Contract

### Header
```
┌──────────────────────────────────────────────────────────┐
│ [BLACK BAR - full width]                                  │
│                                                          │
│  ●DRESSField    [ნავიგაცია]  [ნავიგაცია]    🛒(2)  👤   │
│                                                          │
└──────────────────────────────────────────────────────────┘

Desktop: Logo left, nav center, cart+auth icons right
Mobile:  Logo left, hamburger right (cart icon always visible)
Height:  64px (desktop), 56px (mobile)
Position: Sticky top
```

### Mobile Menu
```
┌──────────────────────────────────────────────────────────┐
│ [Slide-in from right, full height, 80% width]            │
│                                                          │
│  ✕ Close                                                 │
│                                                          │
│  მთავარი (Home)                                          │
│  პროდუქცია (Products)                                    │
│  კატეგორიები (Categories)                                │
│  შეკვეთა (Custom Order)                                  │
│  ─────────────                                           │
│  შესვლა (Login)                                          │
│  რეგისტრაცია (Register)                                  │
│                                                          │
│  [Instagram icon]  [Facebook icon]                       │
└──────────────────────────────────────────────────────────┘
```

### Footer
```
┌──────────────────────────────────────────────────────────┐
│ [DARK GRAY - full width]                                  │
│                                                          │
│  ●DRESSField          ნავიგაცია        კონტაქტი          │
│                       მთავარი          +995 5XX XXX XXX  │
│  [brand tagline       პროდუქცია       info@dressfield.ge │
│   in Georgian]        კატეგორიები      თბილისი, საქართველო│
│                       შეკვეთა                             │
│                                                          │
│  [Instagram]  [Facebook]  [WhatsApp]                     │
│                                                          │
│  ───────────────────────────────────────                 │
│  © 2026 DressField. ყველა უფლება დაცულია.                │
└──────────────────────────────────────────────────────────┘

Desktop: 3-column grid (brand, nav links, contact info)
Mobile:  Stacked single column
Padding: 48px vertical
```

### Page Container
```
Max width: 1280px (7xl)
Padding:   16px mobile, 24px tablet, 32px desktop
Center:    mx-auto
```

---

## Component Specs (Phase 1)

### Button Variants

| Variant | Background | Text | Border | Usage |
|---------|-----------|------|--------|-------|
| Primary | `#7C3AED` | `#FFFFFF` | none | Main CTAs: "Add to Cart", "Pay Now" |
| Secondary | `transparent` | `#0A0A0A` | `#E5E7EB` | Secondary actions: "Cancel", "Back" |
| Ghost | `transparent` | `#6B7280` | none | Tertiary: icon buttons, nav items |
| Destructive | `#EF4444` | `#FFFFFF` | none | Delete, remove actions |

**Button sizing:**
- Default: h-10 px-4 text-[15px]
- Small: h-8 px-3 text-[13px]
- Large: h-12 px-6 text-[16px]
- Icon: h-10 w-10

**Hover states:** Darken background by 10%. Transition: 150ms ease.
**Focus:** 2px violet ring offset by 2px.
**Disabled:** opacity-50, cursor-not-allowed.

### Input Fields

```
Height:    40px (h-10)
Border:    1px solid #E5E7EB
Radius:    6px (rounded-md)
Padding:   0 12px
Font:      15px / 400
Focus:     border-color: #7C3AED, ring: 2px #EDE9FE
Error:     border-color: #EF4444, ring: 2px #FEF2F2
Label:     14px / 500, mb-1.5, text-#0A0A0A
Helper:    12px / 400, mt-1, text-#6B7280
Error msg: 12px / 400, mt-1, text-#EF4444
```

### Card

```
Background: #FFFFFF
Border:     1px solid #E5E7EB
Radius:     8px (rounded-lg)
Shadow:     sm (0 1px 2px rgba(0,0,0,0.05))
Hover:      shadow-md, border-color: #D1D5DB (transition 150ms)
Padding:    16px (md)
```

---

## Auth Pages Layout

### Login Page
```
┌──────────────────────────────────────────────────────────┐
│                    [HEADER]                               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│              ┌─────────────────────┐                     │
│              │                     │                     │
│              │   ●DRESSField       │                     │
│              │                     │                     │
│              │   შესვლა (Login)    │                     │
│              │                     │                     │
│              │   [Email input]     │                     │
│              │   [Password input]  │                     │
│              │                     │                     │
│              │   [შესვლა] (violet) │                     │
│              │                     │                     │
│              │   Forgot password?  │                     │
│              │   Don't have an     │                     │
│              │   account? Register │                     │
│              │                     │                     │
│              └─────────────────────┘                     │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                    [FOOTER]                               │
└──────────────────────────────────────────────────────────┘

Card: max-w-md, mx-auto, mt-16
```

### Register Page
Same layout as login, with additional fields:
- First Name + Last Name (side by side on desktop)
- Email
- Phone (optional, Georgian format)
- Password + Confirm Password

---

## Copywriting Contract

| Element | Georgian | English (reference) |
|---------|----------|---------------------|
| Primary CTA (login) | შესვლა | Log In |
| Primary CTA (register) | რეგისტრაცია | Register |
| Primary CTA (add to cart) | კალათაში დამატება | Add to Cart |
| Primary CTA (checkout) | შეკვეთის გაფორმება | Proceed to Checkout |
| Nav: Home | მთავარი | Home |
| Nav: Products | პროდუქცია | Products |
| Nav: Categories | კატეგორიები | Categories |
| Nav: Custom Order | შეკვეთა | Custom Order |
| Nav: Login | შესვლა | Log In |
| Nav: Register | რეგისტრაცია | Register |
| Nav: Cart | კალათა | Cart |
| Nav: My Orders | ჩემი შეკვეთები | My Orders |
| Nav: Admin | ადმინი | Admin |
| Empty cart heading | კალათა ცარიელია | Your cart is empty |
| Empty cart body | დაათვალიერეთ პროდუქცია | Browse our products to find something you love |
| Auth error | ელ-ფოსტა ან პაროლი არასწორია | Invalid email or password |
| Password reset | პაროლის აღდგენა | Reset Password |
| Footer copyright | © 2026 DressField. ყველა უფლება დაცულია. | © 2026 DressField. All rights reserved. |
| Destructive confirmation | წაშლა: დარწმუნებული ხართ? | Delete: Are you sure? |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| Mobile | < 640px | Single column, hamburger menu, stacked footer |
| Tablet | 640-1024px | 2-column grids, expanded nav, side-by-side forms |
| Desktop | > 1024px | Full nav, 3-4 column grids, max-width container |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | Button, Input, Label, Card, Sheet (mobile menu), DropdownMenu, Avatar, Badge, Separator, Skeleton | not required |
| (no third-party) | — | — |

All components from official shadcn/ui registry only. No third-party registries in Phase 1.

---

## Animation & Transitions

| Element | Animation | Duration |
|---------|-----------|----------|
| Button hover | background-color darken | 150ms ease |
| Card hover | shadow + border-color | 150ms ease |
| Mobile menu | slide-in from right | 200ms ease-out |
| Mobile menu close | slide-out to right | 150ms ease-in |
| Page transitions | none (static export) | — |
| Input focus | ring appear | 150ms ease |
| Toast notifications | slide-in from top-right | 200ms ease-out |

No heavy animations. CSS transitions only. No Framer Motion.

---

## Checker Sign-Off

- [x] Dimension 1 Copywriting: PASS
- [x] Dimension 2 Visuals: PASS
- [x] Dimension 3 Color: PASS
- [x] Dimension 4 Typography: FLAG — Add Heading 4 / Subheading role (18px/600) before Phase 2
- [x] Dimension 5 Spacing: PASS
- [x] Dimension 6 Registry Safety: PASS

**Approval:** approved 2026-03-27

# Features Research: Embroidery E-Commerce

**Researched:** 2026-03-27
**Domain:** Embroidery e-commerce, Georgian market, <50 product catalog

## Table Stakes (Must Have or Users Leave)

### Product Browsing
| Feature | Complexity | MVP? | Dependencies |
|---------|-----------|------|--------------|
| Product listing with grid/list view | Low | Yes | Products API |
| Category filtering | Low | Yes | Categories API |
| Sort by price, newest | Low | Yes | Products API |
| Product detail page with image gallery | Medium | Yes | Product images |
| Product variants (size, color) | Medium | Yes | Variants schema |
| Search (basic text search) | Medium | Deferred to P2 polish | Products API + search index |

### Shopping Cart
| Feature | Complexity | MVP? | Dependencies |
|---------|-----------|------|--------------|
| Add/remove items | Low | Yes | — |
| Update quantity | Low | Yes | — |
| Cart persistence (localStorage for guests) | Low | Yes | — |
| Cart icon with item count in header | Low | Yes | Layout |
| Cart drawer or dedicated page | Medium | Yes | UI components |

### Checkout & Payments
| Feature | Complexity | MVP? | Dependencies |
|---------|-----------|------|--------------|
| Shipping address form | Low | Yes | Address schema |
| Order summary before payment | Low | Yes | Cart + pricing |
| Secure payment redirect (BOG iPay) | High | Yes | iPay integration |
| Order confirmation page | Low | Yes | Order + payment status |
| Guest checkout (no account required) | Medium | Yes | Guest order flow |

### Order Management
| Feature | Complexity | MVP? | Dependencies |
|---------|-----------|------|--------------|
| Order history for customers | Low | Yes | Orders API |
| Order status tracking | Low | Yes | Order status enum |
| Order confirmation email | Medium | Yes | SMTP setup |
| Admin order list with status filter | Medium | Yes | Admin auth |
| Admin order status update | Low | Yes | Admin auth |

### Mobile & Responsive
| Feature | Complexity | MVP? | Dependencies |
|---------|-----------|------|--------------|
| Responsive layout (mobile, tablet, desktop) | Medium | Yes | Tailwind breakpoints |
| Touch-friendly navigation | Low | Yes | Mobile menu component |
| Optimized images for mobile | Medium | Yes | Image pipeline |

### Authentication
| Feature | Complexity | MVP? | Dependencies |
|---------|-----------|------|--------------|
| Email/password registration | Medium | Yes | Identity + JWT |
| Login with session persistence | Medium | Yes | JWT refresh |
| Password reset via email | Medium | Yes | SMTP |
| Logout | Low | Yes | Token invalidation |

### Admin
| Feature | Complexity | MVP? | Dependencies |
|---------|-----------|------|--------------|
| Product CRUD | Medium | Yes | Products API |
| Image upload and management | High | Yes | Blob Storage |
| Category management | Low | Yes | Categories API |
| Order management | Medium | Yes | Orders API |
| Dashboard with basic stats | Medium | Yes | Aggregation queries |

---

## Differentiators (Competitive Advantage for Embroidery)

### Custom Design Upload & Preview (PRIMARY DIFFERENTIATOR)
| Feature | Complexity | MVP? | Dependencies |
|---------|-----------|------|--------------|
| Photo upload (JPG/PNG) with drag-and-drop | Medium | Yes | react-dropzone |
| Browser-based crop/rotate/resize editor | High | Yes | Konva canvas |
| Embroidery option selection (size, placement, material, thread colors) | Medium | Yes | Options schema |
| **Live preview mockup on product** | High | Yes | Konva canvas overlay |
| Dynamic pricing (base + option add-ons) | Medium | Yes | Pricing engine |
| Admin review workflow (approve/reject/request changes) | Medium | Yes | Custom design status |

**Why this matters:** Most Georgian embroidery businesses take orders via Instagram DM or phone. Offering a visual customization tool with live preview creates a significantly better customer experience and differentiates from competitors using generic e-commerce templates or social media ordering.

### Georgian Market Specifics
| Feature | Complexity | MVP? | Dependencies |
|---------|-----------|------|--------------|
| Georgian language UI (ქართული) | Low | Yes | Georgian font + translations |
| GEL (₾) currency formatting | Low | Yes | Intl.NumberFormat |
| Georgian phone number validation | Low | Yes | Form validation |
| Georgian address format | Low | Yes | Address form |

### SEO & Marketing
| Feature | Complexity | MVP? | Dependencies |
|---------|-----------|------|--------------|
| SSG product pages (SEO) | Medium | Yes | Static export config |
| JSON-LD structured data | Medium | Yes | Schema markup |
| Meta Pixel for Facebook/Instagram ads | Medium | Yes | Analytics abstraction |
| XML sitemap | Low | Yes | next-sitemap |
| Open Graph tags for social sharing | Low | Yes | Metadata API |

---

## Anti-Features (Do NOT Build)

| Feature | Why Not | Risk if Built |
|---------|---------|---------------|
| **Real-time inventory tracking** | <50 products, managed manually. Real-time stock is over-engineering. | Adds database complexity, race conditions, stock sync bugs |
| **AI product recommendations** | Too few products for meaningful recommendations. Simple "related products" by category is sufficient. | ML pipeline complexity with no ROI |
| **Customer chat/messaging system** | Small team handles inquiries via WhatsApp/phone. Building chat is high maintenance. | Unmonitored chat creates worse experience than no chat |
| **Multi-vendor marketplace** | Single business, not a platform. | Massive scope increase for zero business value |
| **Subscription/recurring billing** | Embroidery is one-time purchase. No subscription model exists. | Wrong revenue model for the product |
| **Complex discount engine** | Simple coupon codes in v2 are sufficient. Rule-based discounts (buy 3 get 1 free, etc.) are over-engineering for launch. | Pricing complexity, edge cases, customer confusion |
| **User-generated content** | Reviews/ratings can wait until order volume justifies it. | Moderation burden, spam risk, empty review sections look bad |
| **Advanced analytics dashboard** | Google Analytics + Meta Events Manager provide dashboards for free. Building custom analytics is reinventing the wheel. | Development time with worse results than free tools |
| **Progressive Web App (PWA)** | Static export + responsive design covers mobile. PWA adds service worker complexity without clear benefit for e-commerce. | Offline mode is meaningless for e-commerce (need real-time pricing/stock) |
| **Email marketing automation** | Use Mailchimp/SendGrid for newsletters. Building in-app email campaigns is massive scope. | Deliverability issues, CAN-SPAM compliance, template management |

---

## Feature Priority Matrix

```
                     HIGH IMPACT
                         │
    Custom Design Preview │  Payment Integration
    Product Catalog       │  Guest Checkout
    SEO / SSG Pages       │  Order Management
                         │
LOW EFFORT ──────────────┼──────────────── HIGH EFFORT
                         │
    Category Filtering    │  Image Editor (crop/rotate)
    Cart Persistence      │  Admin Dashboard Stats
    Meta Pixel            │  Email Notifications
                         │
                     LOW IMPACT
```

**Build order recommendation:**
1. Foundation (auth, layout) — enables everything
2. Product catalog + admin — core content
3. Custom design flow — primary differentiator
4. Cart + checkout — monetization path
5. Payments — completes purchase funnel
6. Analytics + polish — optimization

---
*Research completed: 2026-03-27*

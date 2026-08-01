# Gigino Restaurant POS Design System

## Product character

Gigino is a calm, modern restaurant command center for cashiers, floor staff, and administrators. The interface should feel as considered as a contemporary Mediterranean dining room: warm, tactile, confident, and operationally precise. It must never look like a generic SaaS template.

## Visual direction

- Use warm ivory as the application canvas, crisp white for working surfaces, and deep espresso for navigation and high-emphasis controls.
- Use terracotta red as the primary action and brand accent. It should feel culinary and premium, not alarming.
- Use fresh herb green for paid, available, profitable, connected, and other positive states.
- Held tables and held orders are always unmistakably red with a solid or strongly tinted treatment.
- Amber represents occupied or currently active service.
- Prefer confident flat surfaces with fine borders and selective soft shadows. Avoid glassmorphism, heavy gradients, excessive pills, and decorative clutter.
- Introduce subtle editorial details: oversized page titles, compact uppercase eyebrow labels, tabular numbers, and occasional asymmetric composition.

## Color tokens

- Canvas / warm ivory: `#F6F3ED`
- Surface / white: `#FFFFFF`
- Surface muted: `#EFEAE1`
- Espresso: `#1C1917`
- Espresso soft: `#292522`
- Primary terracotta: `#C93B27`
- Primary hover: `#A92E1F`
- Herb green: `#247A4A`
- Herb tint: `#EAF5EE`
- Amber: `#B86B16`
- Amber tint: `#FFF3DC`
- Held red: `#D62F2F`
- Held tint: `#FDECEC`
- Blue information: `#2F66D0`
- Text primary: `#1C1917`
- Text secondary: `#726A62`
- Border: `#DED7CD`
- Border strong: `#BDB4A8`

All text/background pairs must meet WCAG AA contrast.

## Typography

- Primary UI family: `Manrope`, with `Inter`, system-ui, and sans-serif fallbacks.
- Page titles: 34–44 px, weight 750–800, tight tracking.
- Section titles: 20–24 px, weight 700–800.
- Body: 14–16 px, weight 450–550, generous line height.
- Labels and eyebrows: 11–13 px, weight 700, uppercase with restrained tracking.
- Monetary values and operational counts use tabular numerals.

## Shape and depth

- Main panels: 20 px corner radius.
- Cards: 16 px corner radius.
- Inputs and buttons: 12–14 px corner radius.
- Small status chips: 999 px pill radius.
- Default border: 1 px warm gray.
- Use a subtle card shadow only for floating or primary work surfaces: `0 10px 30px rgba(28,25,23,0.07)`.

## Spacing and density

- Base spacing unit: 4 px.
- Page padding: 20 px tablet, 28–32 px desktop.
- Panel padding: 20–24 px.
- Touch targets: minimum 48 px; core cashier actions 56–64 px.
- Keep operational content dense but never cramped. Separate major zones with 24–32 px.

## Navigation

- Desktop: fixed 236–248 px espresso sidebar with a compact Gigino chef-mark, clear role label, primary navigation, live connection state, and worker identity at the bottom.
- Tablet: compact top bar and persistent bottom navigation; no tiny hamburger-only navigation for core cashier actions.
- Active navigation uses a warm white surface and espresso text. Icons are simple line icons.
- The cashier order screen prioritizes menu and cart; navigation chrome must not compete with payment actions.

## Core components

### Buttons

- Primary: terracotta background, white label, large readable type.
- Dark action: espresso background, white label.
- Success/payment confirmation: herb green.
- Secondary: white or muted ivory with strong border.
- Destructive/held: held red.
- Include visible hover, pressed, focus, loading, and disabled states.

### Inputs

- 52–56 px height for POS entry and search.
- Clear label, optional leading icon, strong focus ring, inline error message.
- Numeric payment fields use tabular numerals and visually emphasize MAD.

### Status

- Available: green-tinted card with green indicator.
- Occupied: amber-tinted card with elapsed time and running total.
- Held: solid held-red top band or strong red card, white/red-contrast text, and pause icon.
- Paid: green with check icon.

### Tables

- Table cards are large tap targets with table name, seats/guest count, elapsed time, worker, and current total where available.
- Status must be understandable without relying on color alone.

### Product cards

- Food photography occupies the upper 52–58% of the card with a consistent aspect ratio.
- Show product name, short category/description, and a bold selling price.
- Include a large add affordance; unavailable items are visibly disabled.

### Order summary

- Sticky desktop panel and bottom-sheet-like tablet treatment.
- Each line shows item, quantity controls, unit price, line total, and remove action.
- Totals are visually separated and easy to scan.
- Payment area makes Total, Amount received, and Change explicit.
- Cash and Card actions are large, distinct, and never ambiguous.

### Analytics

- Use a practical bento grid: primary revenue/profit metric, compact supporting KPIs, revenue trend, payment split, top products, table turnover, and live activity.
- Revenue, product cost, and gross profit must be mathematically distinct.
- Charts are high contrast, labeled, and readable without hover.
- Real-time paid orders appear in a compact activity stream.

## Page-specific composition

### Sign in

- Split desktop layout: cinematic dark hospitality story panel and focused ivory login form.
- Keep the form above the fold, with a clear password field and one dominant sign-in action.
- Mobile becomes a single clean form with condensed branding.

### Cashier tables

- Lead with current shift, table status counts, search/filter controls, and a responsive table grid.
- Held tables must be the strongest warning element.
- Show the worker's sales today without distracting from selecting a table.

### Cashier order

- Three-zone desktop layout: category rail, product grid, sticky order/payment summary.
- Tablet collapses categories into horizontal tabs and retains a persistent cart/total action.
- Product discovery and adding must be one-tap operations.

### Worker overview and orders

- Show today's sales, handled orders, visitors, average ticket, and recent work.
- Recent orders clearly separate open, held, and paid states.

### Admin overview

- Start with a strong live revenue/profit header and time-range control.
- Then show KPI cards, trend charts, payment mix, best sellers, table activity, and live payments.
- Values update without disruptive layout shifts.

### Admin products, tables, workers, reports

- Use responsive management tables/cards with search, filters, clear empty/loading/error states, and focused create/edit modals.
- Products always show both selling price and cost price, plus calculated unit margin.
- Reports support day/week/month/year ranges and separate revenue, product cost, gross profit, visitors, items sold, average ticket, and margins.

### Profile

- Simple account page for name, email, and password change with security-focused feedback.

## Responsive behavior

- Optimize first for 1280–1600 px POS desktops and 768–1180 px landscape tablets.
- Support 320 px mobile without horizontal page overflow.
- At tablet widths, keep order totals and payment accessible without scrolling back to the top.
- Management data may switch from tables to cards on small screens.

## Accessibility and states

- Every icon-only control has an accessible label.
- Keyboard focus is always visible.
- Never convey status through color alone.
- Provide skeleton/loading, empty, retryable error, disabled, and offline/reconnecting states.
- Motion is brief and functional; respect reduced-motion preferences.

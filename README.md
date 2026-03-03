# Sales Intelligence Dashboard

Enterprise-grade analytics dashboard built with React, Recharts, and modern design principles.

## Features

### Design System
- **Font**: Inter (Google Fonts) with weights 300-700
- **Color Palette**: Deep indigo primary (#1e1b4b), indigo accent (#6366f1)
- **Consistent spacing**: 8px grid system
- **Glassmorphism effects** on KPI cards
- **Smooth animations** and micro-interactions

### Layout
- **Sidebar Navigation** (240px, collapsible to 64px)
  - Overview, Trends, Geographic, Analytics, Alerts, Underperformance
  - Mobile: Bottom tab bar
- **Top Bar** with filters button, dark mode toggle, last updated timestamp
- **Filter Drawer** slides in from right with multi-select filters
- **Filter Chips** show active filters with individual dismiss

### KPI Cards
- Horizontal scrollable glassmorphism cards
- 9 metrics: Total Sales, Budget, Variance, Stores, Transactions, Budget Transactions, WoW, MoM, YoY
- **Sparklines** (last 7 days) inside each card
- Color-coded borders (green/amber/red based on variance)
- Animated counters and slide-up entrance

### Overview Page (Bento Grid)
- **Performance Score** donut chart (Sales/Budget ratio)
- **Top 5 Stores** leaderboard with rank badges
- **Alert Summary** with critical/warning/info counts
- **Sales Distribution** pie chart by country

### Trends Page
- **Area charts** with gradient fills
- Toggle between Sales, Budget, Variance views
- **Brush/zoom** component for date range selection
- Reference lines for budget targets
- Animated line drawing on mount

### Geographic Page
- **Data table + bar visualization** hybrid
- Inline sales bars, variance badges
- **Expandable rows** showing brand breakdown
- Sort by Sales, Variance, Store Count
- Country flags and IDs displayed
- Summary donut chart

### Analytics Page
- **Grouped bar chart** with toggleable series
- **Channel Mix** pie chart (Channel, HomeDelivery_Channel, Digital_Channel)
- **Transactions vs Budget Transactions** comparison chart
- **Variance Heatmap** (Brand × Country grid with color-coded cells)

### Alerts Page
- **Notification feed** layout
- Severity icons and pulsing red border for critical alerts
- Filter by Critical/Warning/Info
- Store name, brand, country, alert type tags
- Timestamps for each alert
- "Mark All Resolved" button

### Underperformance Page
- **Sticky header** table with color-coded rows
- **Inline sparklines** (last 4 weeks trend)
- **Expandable rows** with weekly breakdown
- Search/filter input
- **Export to CSV** button
- Adjustable threshold slider

## Data Utilization
All JSON fields are used:
- Date, StoreID, Store, Market, Country_ID, Brand
- Channel, HomeDelivery_Channel, Digital_Channel
- Sales, Transactions, Budget, Budget_Transactions

## Tech Stack
- React 18
- Recharts for charts
- date-fns for date manipulation
- Vite for build
- Pure CSS (no UI libraries)

## Running the Dashboard

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
python3 serve.py
```

Dashboard runs at **http://localhost:8080**

## Data Processing
The dashboard loads from `/data.json` (converted from Excel):
```bash
python3 convert_data.py
```

## Responsive Design
- Desktop: 1440px+
- Laptop: 1024px
- Tablet: 768px
- Mobile: 375px

## Deployment
Upload the `dist/` folder to any static hosting:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

## Performance
- Handles 1M+ rows of data
- Optimized JSON loading (298MB)
- Lazy rendering with animations
- Efficient data filtering and aggregation

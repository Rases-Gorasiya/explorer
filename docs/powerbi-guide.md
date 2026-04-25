# Power BI Glassmorphic Dashboard — Design Guide

A step-by-step guide to recreate the Explorer "Antigravity" glassmorphism aesthetic in Power BI.

---

## 1. Import the Custom Theme

Download [`powerbi-theme.json`](./powerbi-theme.json) and import it:

1. Open Power BI Desktop
2. Go to **View → Themes → Browse for themes**
3. Select the `powerbi-theme.json` file
4. Click **Open** — the theme will apply immediately

---

## 2. Dashboard Canvas Setup

### Background
- **Canvas background color**: `#0a0f1e` (Deep Space)
- **Transparency**: 0%
- **Canvas size**: 1920 × 1080 (16:9 widescreen)

### Page Navigation
- Use **Bookmarks** for multi-page navigation
- Add a navigation bar with transparent buttons at the top

---

## 3. The "Frosted Glass" Container Pattern

Every visual container should simulate glassmorphism. Since Power BI doesn't natively support `backdrop-filter`, use this workaround:

### Creating a Glass Card
1. Insert a **Shape** (Rectangle)
2. Set fill color to `#1a2332` with **85% transparency** (15% opacity)
3. Set border to `#ffffff` with **90% transparency** (10% opacity), 1px width
4. Round corners: **16px**
5. Add shadow: color `#000000`, distance 8, blur 20, transparency 60%

### Tip: Create a "Glass Card" shape and use Format Painter to replicate across visuals.

---

## 4. 3-Column Layout

```
┌──────────────────────────────────────────────────────┐
│              Floating Zone Slicer (Top)               │
├────────────┬─────────────────────┬────────────────────┤
│            │                     │                    │
│  Column 1  │     Column 2        │     Column 3       │
│  (25%)     │     (45%)           │     (30%)          │
│            │                     │                    │
│ ┌────────┐ │ ┌─────────────────┐ │ ┌────────────────┐ │
│ │ KPI    │ │ │ Tourist Density │ │ │ Top Rated      │ │
│ │ Cards  │ │ │ Heatmap         │ │ │ Places Table   │ │
│ └────────┘ │ └─────────────────┘ │ └────────────────┘ │
│ ┌────────┐ │ ┌─────────────────┐ │ ┌────────────────┐ │
│ │ Filter │ │ │ Value Matrix    │ │ │ Zone           │ │
│ │ Panel  │ │ │ Scatter Plot    │ │ │ Breakdown      │ │
│ └────────┘ │ └─────────────────┘ │ └────────────────┘ │
│            │                     │                    │
└────────────┴─────────────────────┴────────────────────┘
```

### Column Positions (px at 1920×1080)
| Column | X Start | Width |
|--------|---------|-------|
| 1 | 30 | 430 |
| 2 | 480 | 790 |
| 3 | 1290 | 600 |

---

## 5. Floating Zone Slicer

1. Insert a **Slicer** visual
2. Field: `Zone`
3. Slicer type: **Horizontal List** (Tile slicer)
4. Position: Top-center of the canvas, spanning full width
5. **Formatting**:
   - Background: `#1a2332`, transparency 80%
   - Border: `#ffffff`, transparency 88%
   - Font: Segoe UI Semibold, 12pt, color `#e0e0e0`
   - Selection color: `#00f2ff`
   - Corner radius: 12px
6. Add a shadow to simulate "floating": distance 4, blur 16, color `#000000`

---

## 6. Hero Visual: Tourist Density Heatmap

### Visual Type: Filled Map or Shape Map

**Configuration:**
- **Location**: Zone (maps to India's zones — North, South, East, West, Central)
- **Color saturation**: `Sum of Number of Google Reviews in Lakhs`
- **Tooltips**: Zone, Count of landmarks, Average Rating

**Formatting:**
- Color scale:
  - Minimum: `#0a2e4a` (low density)
  - Middle: `#00a8b3` (medium)
  - Maximum: `#00f2ff` (high density — Cyber Cyan)
- Background: transparent
- Title: "Tourist Density by Zone", font Segoe UI Semibold, 16pt, color `#00f2ff`

### Alternative: ArcGIS Map
If you have Power BI Pro, use the ArcGIS Maps visual for richer interactivity:
- Plot each landmark as a point using City
- Size by Number of Google Reviews
- Color by Zone

---

## 7. The "Value Matrix" Scatter Plot

### Visual Type: Scatter Chart

**Configuration:**
- **X-axis**: `Entrance Fee in INR`
- **Y-axis**: `Google Review Rating`
- **Size**: `Significance` (encode numerically: Historical=3, Religious=2, Natural=2, Cultural=1)
- **Legend/Color**: `Zone`
- **Play axis** (optional): none
- **Details**: `Name`

**Formatting:**
- Data colors per zone:
  - North: `#3b82f6`
  - South: `#22c55e`
  - East: `#f59e0b`
  - West: `#ec4899`
  - Central: `#a855f7`
- Bubble transparency: 25%
- Gridlines: color `#1a2332`
- Axis labels: color `#94a3b8`, font Segoe UI, 10pt
- Title: "Value Matrix — Fee vs Rating", color `#ffca28`
- Background: `#0a0f1e`, transparency 0%
- Border: `#ffffff`, transparency 90%, radius 16px

---

## 8. KPI Cards (Column 1)

Create 4 KPI cards:

| KPI | Measure | Icon Color |
|-----|---------|------------|
| Total Landmarks | Count of Name | `#00f2ff` |
| Avg Rating | Average of Google Review Rating | `#ffca28` |
| Free Entry % | % where Entrance Fee = 0 | `#22c55e` |
| Avg Visit Time | Average of Time Needed | `#a855f7` |

**Formatting per card:**
- Use a **Card** visual inside a glass container shape
- Value font: Segoe UI Bold, 28pt, color `#f0f4ff`
- Label font: Segoe UI, 10pt, color `#94a3b8`
- Background: transparent (the glass shape behind provides the frost)

---

## 9. Top Rated Places Table (Column 3)

### Visual Type: Table

**Configuration:**
- Columns: Rank (index), Name, City, Rating, Fee
- Sort by: Google Review Rating descending
- Top N: 15

**Formatting:**
- Header: background `#1a2332`, font color `#00f2ff`, bold
- Row alternating colors: `#0a0f1e` and `#0e1424`
- Font color: `#e0e0e0`
- Gridlines: `#1a2332`
- Border: none (container has the glass border)

---

## 10. Zone Breakdown Donut (Column 3)

### Visual Type: Donut Chart

**Configuration:**
- Legend: Zone
- Values: Count of Name

**Formatting:**
- Colors: use zone color palette from §7
- Inner radius: 60%
- Labels: outside, color `#94a3b8`
- Background: transparent

---

## 11. Typography

| Element | Font | Weight | Size | Color |
|---------|------|--------|------|-------|
| Dashboard title | Segoe UI | Bold | 24pt | `#00f2ff` |
| Section headings | Segoe UI | Semibold | 16pt | `#f0f4ff` |
| Body text | Segoe UI | Regular | 11pt | `#94a3b8` |
| KPI values | Segoe UI | Bold | 28pt | `#f0f4ff` |
| KPI labels | Segoe UI | Regular | 10pt | `#64748b` |
| Axis labels | Segoe UI | Regular | 10pt | `#94a3b8` |

---

## 12. Interaction Settings

1. **Edit Interactions**: Set the Zone Slicer to filter ALL visuals on the page
2. **Cross-filter**: Enable cross-highlight between the scatter plot and heatmap
3. **Drillthrough**: Add a drillthrough page for individual landmark details
   - Show all 16 columns in a formatted card layout
   - Use the same glass container pattern

---

## 13. Tips for Maximum Glassmorphism Effect

1. **Layer shapes behind visuals** — Place semi-transparent shapes as containers
2. **Use consistent spacing** — 20px gaps between all elements
3. **Subtle shadows on everything** — Simulates the floating/antigravity effect
4. **Accent with cyan/gold sparingly** — Only titles, highlights, and interactive elements
5. **Keep data ink ratio high** — The dark background lets colorful data points pop
6. **Test on a dark monitor** — Glass effects look best on high-contrast displays

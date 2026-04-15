# Planning Guide

RepoPulse Sketch is a minimalist, hand-drawn style dashboard that visualizes GitHub repository statistics with a whiteboard sketch aesthetic reminiscent of architectural notebooks and technical drawings.

**Experience Qualities**:
1. **Playful** - The hand-drawn aesthetic with imperfect lines and sketchy fills creates a friendly, approachable feel that makes data exploration enjoyable rather than clinical.
2. **Organic** - Rough, slightly wobbly strokes and hand-written fonts give the interface a human touch that stands in delightful contrast to typical digital dashboards.
3. **Focused** - A clean, uncluttered layout with clear visual hierarchy ensures users can quickly grasp repository health without drowning in complexity.

**Complexity Level**: Light Application (multiple features with basic state)
This is a focused data visualization tool with repository search, API integration, error handling, and dynamic chart rendering—more than a single-purpose calculator but simpler than a multi-view platform.

## Essential Features

**Repository Search**
- Functionality: Accepts GitHub repository input as "owner/repo" format or full URL
- Purpose: Enables users to quickly look up any public repository without navigation friction
- Trigger: User types into search input and presses Enter or clicks search button
- Progression: Input focused → User types → Submit (Enter/Click) → Loading state → Data displays
- Success criteria: Successfully parses URLs and owner/repo strings, calls GitHub API, handles invalid inputs gracefully

**Statistics Dashboard**
- Functionality: Displays key repository metrics (stars, forks, watchers, latest release) in hand-drawn card widgets
- Purpose: Provides at-a-glance repository health indicators that developers care about
- Trigger: Successful repository data fetch
- Progression: API response received → Parse metrics → Render sketch-style cards with numbers → Animate into view
- Success criteria: All metrics display correctly, cards have consistent sketchy styling, numbers are readable

**Commit Activity Chart**
- Functionality: Line chart showing monthly commit activity over the last 12 months
- Purpose: Reveals repository maintenance patterns and development momentum
- Trigger: Commit data available from API
- Progression: Fetch commit history → Aggregate by month → Render rough.js chart → Show sketchy line with points
- Success criteria: Chart renders with hand-drawn aesthetic, months labeled clearly, hover shows exact values

**Star Growth Visualization**
- Functionality: Timeline chart showing star count growth trend
- Purpose: Illustrates repository popularity trajectory and community adoption
- Trigger: Star history data available
- Progression: Fetch historical data → Plot growth curve → Render with sketchy style → Display trend
- Success criteria: Growth pattern visible, chart feels hand-drawn, scale adjusts to data range

**Loading & Error States**
- Functionality: Sketch animation during data fetch, clear error messages for failures
- Purpose: Maintains aesthetic consistency during waits, guides users when things go wrong
- Trigger: API call initiated (loading) or API error received (error state)
- Progression: Loading: Show sketching animation → Error: Display hand-drawn error card with helpful message → Allow retry
- Success criteria: Loading feels playful and on-brand, errors explain what happened (rate limit, 404, network), retry is obvious

## Edge Case Handling

- **Invalid Repository Format**: Show inline validation hint "Try: owner/repo or full GitHub URL" in sketch handwriting style
- **Repository Not Found (404)**: Display friendly hand-drawn error card: "Repository not found. Double-check the name?"
- **API Rate Limit**: Show sketch-style banner: "GitHub API limit reached. Try again in a bit!" with countdown if possible
- **No Commit History**: Render empty chart with dashed sketch line and note "No commits in last 12 months"
- **No Releases**: Display "No releases yet" in the version widget instead of breaking layout
- **Very Large Numbers**: Format stars/forks with K/M notation (e.g., "12.5K stars") to fit in cards
- **Network Failure**: Show offline-style sketch with "Connection lost" and retry button

## Design Direction

The design should evoke the feeling of a developer's whiteboard brainstorming session or an engineer's technical notebook—casual yet purposeful, with the organic imperfection of hand-drawn sketches that makes data feel more approachable and less intimidating.

## Color Selection

A monochromatic sketch aesthetic inspired by fountain pen on cream paper, with subtle accent colors for data visualization.

- **Primary Color (Engineer Blue)**: `oklch(0.25 0.08 250)` - Deep fountain pen blue that serves as the main "ink" color for all strokes, text, and primary UI elements
- **Secondary Color (Sketch Grey)**: `oklch(0.35 0.01 270)` - Charcoal pencil grey for secondary strokes, borders, and de-emphasized elements
- **Accent Color (Highlight Orange)**: `oklch(0.65 0.15 55)` - Soft orange highlighter for interactive elements, data points, and calls-to-action
- **Background (Paper Cream)**: `oklch(0.97 0.01 85)` - Warm off-white reminiscent of aged sketch paper
- **Foreground/Background Pairings**:
  - Background Paper (oklch(0.97 0.01 85)): Engineer Blue text (oklch(0.25 0.08 250)) - Ratio 8.2:1 ✓
  - Accent Orange (oklch(0.65 0.15 55)): White text (oklch(1 0 0)) - Ratio 4.9:1 ✓
  - Card backgrounds (oklch(0.99 0 0)): Sketch Grey (oklch(0.35 0.01 270)) - Ratio 10.1:1 ✓

## Font Selection

Typography should reinforce the hand-drawn, notebook aesthetic with a casual yet legible handwriting style paired with a clean monospace for code/data.

- **Primary Font**: 'Indie Flower' - Casual handwritten font that looks like natural penmanship, used for headings, labels, and body text
- **Monospace Font**: 'JetBrains Mono' - For repository names, URLs, numbers, and technical details requiring precision
- **Typographic Hierarchy**:
  - H1 (App Title): Indie Flower Bold / 36px / loose letter spacing / engineer blue
  - H2 (Repo Name): JetBrains Mono Medium / 24px / normal spacing / sketch grey
  - H3 (Section Headers): Indie Flower / 20px / slight rotation (-1deg for organic feel)
  - Body (Descriptions): Indie Flower / 16px / 1.6 line-height
  - Data Labels: JetBrains Mono / 14px / tabular numbers
  - Large Numbers (Stats): JetBrains Mono Bold / 32px / sketch grey

## Animations

Animations should feel like watching someone sketch in real time—organic, slightly imperfect, and delightful without being distracting.

**Loading State**: A "sketching" animation where lines appear to draw themselves, with a slight wobble effect and a pencil cursor or sketch icon that moves. Duration: continuous loop until data loads.

**Card Entry**: Metrics cards fade in with a gentle slide-up (20px) and slight rotation wobble (rotate from -2deg to 0deg) as if being placed on a table. Stagger by 100ms per card.

**Chart Drawing**: Line charts animate their paths from left to right as if being drawn by hand, with points appearing sequentially. Duration: 800ms with ease-out.

**Hover States**: Interactive elements (buttons, cards) lift slightly (2px translateY) with a subtle shadow increase, mimicking lifting a paper off a desk. Duration: 150ms.

**Error Shake**: When errors occur, the error card does a gentle shake (±3px horizontal) twice to draw attention. Duration: 400ms.

## Component Selection

- **Components**:
  - **Input**: For repository search, customized with sketch-style border using box-shadow and slightly rounded corners
  - **Button**: Primary action button with sketch stroke border, filled with accent orange
  - **Card**: Heavily customized with hand-drawn borders (using rough.js or SVG borders), housing metrics and charts
  - **Alert**: For error messages, styled with sketch aesthetic and appropriate icons
  - **Skeleton**: For loading states, but replaced with custom sketch animation
  - **Separator**: Sketchy hand-drawn lines between sections

- **Customizations**:
  - All card borders rendered with rough.js to create imperfect, sketchy rectangles
  - Custom SVG patterns for paper texture background
  - Rough.js line charts for commit activity and star growth
  - Custom "sketching" loading animation component with animated SVG paths

- **States**:
  - **Input**: Default has light sketch border, focus gets thicker blue sketch border with slight glow
  - **Button**: Default has orange fill with dark sketch outline, hover lifts with deeper shadow, active squashes slightly, disabled shows dashed sketch outline
  - **Cards**: Default subtle shadow, hover lifts with increased shadow, active state not needed
  - **Charts**: Default rendered, hover on data points shows tooltip in sketch bubble

- **Icon Selection**:
  - Search: Magnifying glass icon for search button
  - Star: Star icon for star count metric
  - GitFork: Fork icon for fork count
  - Eye: Eye icon for watchers
  - Tag: Tag icon for latest release
  - AlertCircle: For error messages
  - TrendingUp: For positive growth indicators
  - GitCommit: For commit activity section
  - RefreshCw: For retry/refresh actions (with sketch styling)

- **Spacing**:
  - Container padding: `p-8` on desktop, `p-4` on mobile
  - Card padding: `p-6` internal padding
  - Section gaps: `gap-8` between major sections
  - Metric grid: `gap-4` between stat cards
  - Input group: `gap-2` between input and button
  - Consistent margin-bottom of `mb-6` for section headings

- **Mobile**:
  - Search bar stacks vertically on mobile (<640px) with full-width input and button
  - Metrics cards switch from 4-column grid to 2-column on tablet, single column on mobile
  - Charts maintain aspect ratio but scale width to 100% on mobile
  - Font sizes reduce by 10-15% on mobile for better fit
  - Touch targets minimum 44px for buttons and interactive elements
  - Sticky header with app title and search collapses to compact version on scroll

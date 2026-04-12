# LiveDevMode (LVDM)

A DevTools-style inspector overlay for Chrome that works on any website. Inspect elements, view measurements, spacing, typography, colors, and generate CSS/Tailwind code snippets.

## Features

- **Toggle LVDM** - Click the extension icon or use keyboard shortcut
- **Element Highlighting** - Green outline shows hovered elements, blue for selected
- **Bounding Box** - See exact dimensions of any element
- **Redline Guides** - View spacing between elements and siblings with pixel labels
- **Gap Detection** - Shows CSS gap and measured distances for flex/grid layouts
- **Inspect Panel** - Right-side panel showing:
  - Element tag name and class
  - Dimensions (width/height)
  - Margin (all sides)
  - Padding (all sides)
  - Parent Gap (flex/grid gap values)
  - Typography details
  - Colors (text & background)
  - Layout type (Flexbox/Grid)
- **Code Generation**:
  - CSS snippets
  - Tailwind class suggestions
- **Copy CSS** - One-click copy to clipboard

## Installation

### 1. Load as Unpacked Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `dev-mode-extension` folder
5. The LVDM icon will appear in your toolbar

### 2. Usage

1. **Click the LVDM icon** in the Chrome toolbar to enable inspection mode
2. **Hover** over any element to see the green highlight and redline guides
3. **Click** on an element to lock selection and open the LVDM Inspector panel
4. **Press Escape** or click the close button to deselect
5. **Click on empty space** to deselect and return to hover mode
6. Click the LVDM icon again to disable

### 3. Keyboard Shortcut

- **Windows/Linux**: `Ctrl + Shift + D`
- **macOS**: `Command + Shift + D`

## Files

```
dev-mode-extension/
├── manifest.json      # Extension manifest (MV3)
├── background.js      # Background service worker
├── content.js         # Content script for page interaction
├── overlay.js         # Overlay and panel rendering
├── utils.js           # Helper functions
├── panel.css          # Panel styling (dark theme)
├── icons/             # Extension icons
└── README.md          # This file
```

## Supported Properties

### Dimensions
- Width / Height

### Spacing
- Margin (all sides)
- Padding (all sides)
- Parent Gap (flex/grid gap, column-gap, row-gap)
- Sibling gap distances with direction arrows

### Typography
- Font family
- Font size
- Font weight
- Line height

### Colors
- Text color
- Background color

### Layout Detection
- Display type (flex/grid/block)
- Flexbox properties
- Grid properties
- Gap values

## Requirements

- Chrome 88+ (Manifest V3)
- No external dependencies (Vanilla JS only)

## Notes

- The overlay uses `pointer-events: none` to avoid interfering with page interaction
- Works on any website including local development servers
- Dark theme panel adapts to light mode based on system preference
- Redlines show measured distances to adjacent visible siblings
- Press Escape or click empty space to deselect
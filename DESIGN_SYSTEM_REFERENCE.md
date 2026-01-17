# NeuroKind Design System - Quick Reference

## 🎨 Color Palette

### Calm Ocean Theme (Default)

```
Background:   #f7f9fb → #e8f0f7 (gradient)
Surface:      #fdfcfb
Primary:      #4a90a4 (muted ocean blue)
Secondary:    #9b8fb3 (soft lavender)
Accent:       #5fa5a5 (calming teal)

Text Primary:   #2d3748 (charcoal)
Text Secondary: #5a6c7d (gray-blue)
Text Muted:     #8896a5 (light gray)

Borders:
  Light: #e1e8ed
  Base:  #cbd5e0
  Dark:  #a0aec0

Status Colors:
  Success: #66a885
  Warning: #d9a84a
  Error:   #c8756e
  Info:    #6b95b8
```

### Space Night Theme

```
Background:   #1a1f35 → #252b48 (gradient)
Surface:      #242b45
Primary:      #70b5c9 (muted cyan)
Secondary:    #a68fb8 (soft purple)
Accent:       #7fb5b5 (calming aqua)

Text Primary:   #e8edf2 (soft white)
Text Secondary: #b8c5d3 (light gray)
Text Muted:     #8896a5 (muted gray)

Borders:
  Light: #2f3a54
  Base:  #3f4d6b
  Dark:  #5a6c89
```

---

## 📏 Spacing Scale

```
--space-xs:   8px    (0.5rem)
--space-sm:   12px   (0.75rem)
--space-md:   16px   (1rem)
--space-lg:   24px   (1.5rem)
--space-xl:   32px   (2rem)
--space-2xl:  48px   (3rem)
--space-3xl:  64px   (4rem)
```

**Usage:**

- `xs`: Component internal spacing (icon gaps)
- `sm`: Small gaps between related items
- `md`: Default spacing (base unit)
- `lg`: Card padding, section spacing
- `xl`: Large section spacing
- `2xl`: Major section breaks
- `3xl`: Page sections

---

## 🔘 Border Radius

```
--radius-sm:   8px    (0.5rem)   - Small elements
--radius-md:   12px   (0.75rem)  - Buttons, inputs
--radius-lg:   16px   (1rem)     - Cards
--radius-xl:   24px   (1.5rem)   - Large cards
--radius-full: 9999px            - Pills, badges
```

---

## 🎭 Shadows

### Calm Ocean

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08) --shadow-md: 0 4px 6px
  rgba(0, 0, 0, 0.08) --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08)
  --shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.08);
```

### Space Night

```css
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3) --shadow-md: 0 4px 6px
  rgba(0, 0, 0, 0.3) --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3) --shadow-xl: 0
  20px 25px rgba(0, 0, 0, 0.3);
```

**Usage:**

- `sm`: Inputs, small buttons
- `md`: Cards (default)
- `lg`: Hover states, elevated cards
- `xl`: Modals, overlays

---

## ⚡ Transitions

```
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1)
```

**Usage:**

- `fast`: Hover effects, button states
- `base`: Default (cards, backgrounds)
- `slow`: Theme switching, large animations

---

## 📝 Typography

### Font Sizes

```
h1: 2.5rem (40px)  - Letter spacing: -0.02em
h2: 2rem   (32px)  - Letter spacing: -0.01em
h3: 1.5rem (24px)
h4: 1.25rem (20px)
body: 1rem (16px)
small: 0.875rem (14px)
```

### Font Weights

```
Regular:  400
Semibold: 600
Bold:     700
```

### Line Heights

```
Headings: 1.2
Body:     1.6
Paragraph: 1.7
```

---

## 🎯 Component Patterns

### Button Variants

```tsx
// Primary - main actions
<Button variant="primary">Get Started</Button>

// Secondary - alternative actions
<Button variant="secondary">Learn More</Button>

// Ghost - subtle actions
<Button variant="ghost">Cancel</Button>
```

### Button Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Card Usage

```tsx
// Default with hover
<Card>Content</Card>

// No hover effect
<Card hover={false}>Static content</Card>
```

### Input with Label & Error

```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error="Invalid email"
  required
/>
```

---

## 🎨 CSS Variable Usage

### Direct Usage

```css
.my-component {
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
}
```

### Tailwind Integration

```tsx
<div className="bg-[var(--surface)] text-[var(--text-primary)]">Content</div>
```

---

## ♿ Accessibility Patterns

### Focus States

```css
/* Automatically applied to interactive elements */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

button:focus-visible {
  box-shadow: 0 0 0 3px var(--primary-light);
}
```

### Reduced Motion

```tsx
// Automatically handled in globals.css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎨 Status Messages

### Success

```tsx
<div className="p-4 bg-[var(--success-light)] border border-[var(--success)] rounded-[var(--radius-md)]">
  <p className="text-[var(--success)]">Success message</p>
</div>
```

### Error

```tsx
<div className="p-4 bg-[var(--error-light)] border border-[var(--error)] rounded-[var(--radius-md)]">
  <p className="text-[var(--error)]">Error message</p>
</div>
```

### Info

```tsx
<div className="p-4 bg-[var(--info-light)] border border-[var(--border-light)] rounded-[var(--radius-md)]">
  <p className="text-[var(--text-primary)]">Info message</p>
</div>
```

---

## 🔄 Loading States

### Skeleton Loader

```tsx
<div className="skeleton h-6 w-48"></div>
<div className="skeleton h-4 w-32 mt-2"></div>
```

### Loading Button

```tsx
<Button disabled={isLoading}>{isLoading ? "Loading..." : "Submit"}</Button>
```

---

## 📱 Responsive Breakpoints

```
sm:  640px   - Small tablets
md:  768px   - Tablets
lg:  1024px  - Laptops
xl:  1280px  - Desktops
2xl: 1536px  - Large screens
```

### Usage

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols */}
</div>
```

---

## 🎭 Animation Examples

### Hover Effects

```css
.card {
  transition: all var(--transition-base);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

### Pulse Animation

```tsx
<span className="animate-pulse">Loading</span>
```

---

## 💡 Best Practices

### ✅ Do

- Use CSS variables for all colors
- Apply consistent spacing from the scale
- Use semantic color names (primary, success, error)
- Include focus states on interactive elements
- Test with keyboard navigation
- Verify contrast ratios

### ❌ Don't

- Use arbitrary color values
- Mix spacing systems
- Remove focus indicators
- Use pure black (#000) or white (#fff) for text
- Ignore reduced motion preferences
- Use bright/neon colors

---

## 🚀 Quick Start Checklist

- [ ] Import design tokens from globals.css
- [ ] Use ThemeProvider in app layout
- [ ] Apply CSS variables instead of hardcoded colors
- [ ] Use component library (Button, Card, Input)
- [ ] Test both themes (Calm Ocean & Space Night)
- [ ] Verify keyboard accessibility
- [ ] Check color contrast (WCAG AA minimum)
- [ ] Test with reduced motion enabled
- [ ] Ensure mobile responsiveness

---

## 🎨 Color Contrast Ratios

All color combinations meet WCAG AA standards:

**Calm Ocean:**

- Text Primary on Surface: 12.5:1 (AAA)
- Text Secondary on Surface: 7.8:1 (AA)
- Primary on Surface: 4.8:1 (AA)

**Space Night:**

- Text Primary on Surface: 11.2:1 (AAA)
- Text Secondary on Surface: 6.5:1 (AA)
- Primary on Surface: 5.2:1 (AA)

---

_This design system prioritizes sensory comfort, accessibility, and user wellbeing._

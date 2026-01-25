# NeuroKind UI Components

Sensory-friendly, accessible React components built for the NeuroKind platform.

---

## 🎨 Design Philosophy

These components are specifically designed for neurodivergent users with focus on:

- **Sensory comfort**: Muted colors, soft shadows, calm aesthetics
- **Accessibility**: WCAG AA compliant, keyboard navigable, screen reader friendly
- **Predictability**: Consistent patterns, clear visual hierarchy
- **Flexibility**: Theme support, size variants, customizable
- **Simplicity**: Easy to use, minimal props, clear documentation

---

## 📦 Available Components

### Button

A versatile button component with multiple variants and sizes.

```tsx
import { Button } from "@/components/ui/Button";

// Primary action button
<Button variant="primary" size="lg">
  Get Started
</Button>

// Secondary button
<Button variant="secondary" size="md">
  Learn More
</Button>

// Ghost button (minimal)
<Button variant="ghost" size="sm">
  Cancel
</Button>
```

**Props:**

- `variant`: `"primary"` | `"secondary"` | `"ghost"` (default: `"primary"`)
- `size`: `"sm"` | `"md"` | `"lg"` (default: `"md"`)
- `disabled`: boolean
- `className`: string (additional classes)
- All standard HTML button attributes

**Accessibility:**

- Automatic focus states
- Disabled state with reduced opacity
- Keyboard navigable
- Minimum touch target size (44x44px)

---

### Card

A container component with soft shadows and rounded corners.

```tsx
import { Card } from "@/components/ui/Card";

// Default card with hover effect
<Card>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>

// Static card (no hover)
<Card hover={false}>
  <p>Static content</p>
</Card>
```

**Props:**

- `hover`: boolean (default: `true`) - Enable/disable hover effect
- `className`: string (additional classes)
- `children`: ReactNode

**Features:**

- Soft shadow elevation
- Smooth hover transition (optional)
- Consistent padding
- Rounded corners
- Theme-aware background

---

### Input

A text input component with built-in label and error handling.

```tsx
import { Input } from "@/components/ui/Input";

// Basic input
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
/>

// Input with error
<Input
  label="Username"
  type="text"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  error="Username is required"
  required
/>
```

**Props:**

- `label`: string (optional) - Input label
- `error`: string (optional) - Error message to display
- `className`: string (additional classes)
- All standard HTML input attributes

**Features:**

- Built-in label rendering
- Error state styling
- Focus states
- Accessible form controls
- Theme-aware colors

---

## 🎨 Theme Support

All components automatically adapt to the active theme:

```tsx
import { useTheme } from "@/app/theme-provider";

function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button onClick={toggleTheme}>
      Switch to {theme === "calm-ocean" ? "Space Night" : "Calm Ocean"}
    </Button>
  );
}
```

**Available Themes:**

- `calm-ocean`: Soft blues and greens (default)
- `space-night`: Deep navy with soft accents

---

## ♿ Accessibility Features

### Keyboard Navigation

All components are fully keyboard accessible:

- **Tab**: Navigate between elements
- **Enter/Space**: Activate buttons
- **Escape**: Close modals/menus (when implemented)

### Focus Management

Clear focus indicators on all interactive elements:

```css
/* Automatic focus ring */
:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Screen Readers

- Semantic HTML elements
- Proper ARIA labels
- Descriptive button text
- Form labels associated with inputs

### Reduced Motion

Components respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations reduced to minimal duration */
}
```

---

## 🎨 Customization

### Using className Prop

All components accept a `className` prop for additional styling:

```tsx
<Button className="w-full mt-4">
  Full Width Button
</Button>

<Card className="max-w-md mx-auto">
  Centered Card
</Card>
```

### CSS Variables

Components use CSS variables for theming. You can override them:

```tsx
<div style={{ "--primary": "#5a9db0" }}>
  <Button variant="primary">Custom Color</Button>
</div>
```

---

## 📱 Responsive Design

All components are mobile-first and responsive:

```tsx
// Responsive button group
<div className="flex flex-col sm:flex-row gap-4">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>

// Responsive card grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</div>
```

---

## 🎯 Common Patterns

### Form Layout

```tsx
<form onSubmit={handleSubmit} className="space-y-6">
  <Input
    label="Email"
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    error={errors.email}
    required
  />

  <Input
    label="Password"
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    error={errors.password}
    required
  />

  <Button type="submit" variant="primary" className="w-full">
    Sign In
  </Button>
</form>
```

### Card Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <Card>
    <h3 className="font-bold text-[var(--text-primary)] mb-2">Feature 1</h3>
    <p className="text-[var(--text-secondary)]">Description</p>
  </Card>
  {/* More cards... */}
</div>
```

### Button Group

```tsx
<div className="flex gap-4">
  <Button variant="primary">Confirm</Button>
  <Button variant="secondary">Cancel</Button>
</div>
```

---

## 🔧 Development

### Adding New Components

When creating new components:

1. Follow the existing pattern (see Button.tsx)
2. Use CSS variables for all colors
3. Support theme switching
4. Include accessibility features
5. Add TypeScript types
6. Document props and usage

Example template:

```tsx
"use client";

import { ReactNode } from "react";

interface MyComponentProps {
  children: ReactNode;
  variant?: "default" | "alternative";
  className?: string;
}

export function MyComponent({
  children,
  variant = "default",
  className = "",
}: MyComponentProps) {
  const variantStyles = {
    default: "bg-[var(--surface)]",
    alternative: "bg-[var(--primary-light)]",
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>{children}</div>
  );
}
```

### Testing

Test each component:

1. **Visual**: Both themes, all variants/sizes
2. **Keyboard**: Tab navigation, focus states
3. **Screen reader**: NVDA/JAWS/VoiceOver
4. **Mobile**: Touch targets, responsive layout
5. **Reduced motion**: Verify animations stop
6. **Contrast**: WCAG AA minimum

---

## 📚 Resources

- [Design System Reference](../../../DESIGN_SYSTEM_REFERENCE.md)
- [Migration Guide](../../../MIGRATION_GUIDE.md)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🎨 Color Contrast Compliance

All component combinations meet WCAG AA standards:

| Component      | Background  | Text         | Ratio  | Level |
| -------------- | ----------- | ------------ | ------ | ----- |
| Button Primary | Primary     | White        | 5.1:1  | AA    |
| Card           | Surface     | Text Primary | 12.5:1 | AAA   |
| Input          | Elevated    | Text Primary | 11.8:1 | AAA   |
| Error Message  | Error Light | Error        | 6.2:1  | AA    |

---

## 🐛 Known Issues

None currently! 🎉

If you find a bug or have a suggestion, please create an issue.

---

## 📝 Changelog

### v1.0.0 - Initial Release

- ✨ Button component with 3 variants and 3 sizes
- ✨ Card component with optional hover effect
- ✨ Input component with label and error handling
- ✨ Theme support (Calm Ocean & Space Night)
- ♿ Full accessibility compliance
- 📱 Mobile-first responsive design

---

_Built with care for the neurodivergent community_ 💙

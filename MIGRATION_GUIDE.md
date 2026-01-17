# Migration Guide: Old Styles → NeuroKind Design System

This guide helps you migrate existing components to use the new sensory-friendly design system.

---

## 🔄 Quick Conversion Reference

### Background Colors

**Old:**

```tsx
className = "bg-white";
className = "bg-gray-50";
className = "bg-blue-50";
className = "bg-indigo-100";
```

**New:**

```tsx
className = "bg-[var(--surface)]";
className = "bg-[var(--bg-base)]";
className = "bg-[var(--primary-light)]";
className = "bg-[var(--secondary-light)]";
```

---

### Text Colors

**Old:**

```tsx
className = "text-gray-900";
className = "text-gray-700";
className = "text-gray-600";
className = "text-gray-500";
className = "text-indigo-600";
```

**New:**

```tsx
className = "text-[var(--text-primary)]";
className = "text-[var(--text-secondary)]";
className = "text-[var(--text-secondary)]";
className = "text-[var(--text-muted)]";
className = "text-[var(--primary)]";
```

---

### Border Colors

**Old:**

```tsx
className = "border-gray-300";
className = "border-gray-200";
className = "border-blue-200";
```

**New:**

```tsx
className = "border-[var(--border-base)]";
className = "border-[var(--border-light)]";
className = "border-[var(--primary-light)]";
```

---

### Border Radius

**Old:**

```tsx
className = "rounded"; // 4px
className = "rounded-md"; // 6px
className = "rounded-lg"; // 8px
className = "rounded-xl"; // 12px
```

**New:**

```tsx
className = "rounded-[var(--radius-sm)]"; // 8px
className = "rounded-[var(--radius-md)]"; // 12px
className = "rounded-[var(--radius-lg)]"; // 16px
className = "rounded-[var(--radius-xl)]"; // 24px
```

---

### Shadows

**Old:**

```tsx
className = "shadow";
className = "shadow-md";
className = "shadow-lg";
```

**New:**

```tsx
className = "shadow-[var(--shadow-sm)]";
className = "shadow-[var(--shadow-md)]";
className = "shadow-[var(--shadow-lg)]";
```

---

## 🎨 Component Migration Examples

### Button Migration

**Before:**

```tsx
<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
  Click Me
</button>
```

**After:**

```tsx
import { Button } from "@/components/ui/Button";

<Button variant="primary">Click Me</Button>;
```

---

### Card Migration

**Before:**

```tsx
<div className="bg-white rounded-lg shadow p-6">
  <h3 className="font-bold text-gray-900">Title</h3>
  <p className="text-gray-600">Content</p>
</div>
```

**After:**

```tsx
import { Card } from "@/components/ui/Card";

<Card>
  <h3 className="font-bold text-[var(--text-primary)]">Title</h3>
  <p className="text-[var(--text-secondary)]">Content</p>
</Card>;
```

---

### Input Migration

**Before:**

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
  <input
    type="email"
    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
  />
  {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
</div>
```

**After:**

```tsx
import { Input } from "@/components/ui/Input";

<Input type="email" label="Email" error={error} />;
```

---

### Navigation Migration

**Before:**

```tsx
<nav className="bg-white shadow-sm">
  <div className="max-w-7xl mx-auto px-4 py-4">
    <div className="text-2xl font-bold text-indigo-600">NeuroKind</div>
  </div>
</nav>
```

**After:**

```tsx
<nav className="bg-[var(--surface)] border-b border-[var(--border-light)] shadow-[var(--shadow-sm)]">
  <div className="max-w-7xl mx-auto px-4 py-4">
    <div className="text-2xl font-bold text-[var(--primary)]">NeuroKind</div>
  </div>
</nav>
```

---

### Alert/Message Migration

**Before:**

```tsx
{
  /* Error */
}
<div className="p-4 bg-red-50 border border-red-200 rounded-md">
  <p className="text-red-800">{error}</p>
</div>;

{
  /* Success */
}
<div className="p-4 bg-green-50 border border-green-200 rounded-md">
  <p className="text-green-800">{success}</p>
</div>;
```

**After:**

```tsx
{
  /* Error */
}
<div className="p-4 bg-[var(--error-light)] border border-[var(--error)] rounded-[var(--radius-md)]">
  <p className="text-[var(--error)] text-sm">{error}</p>
</div>;

{
  /* Success */
}
<div className="p-4 bg-[var(--success-light)] border border-[var(--success)] rounded-[var(--radius-md)]">
  <p className="text-[var(--success)] text-sm">{success}</p>
</div>;
```

---

## 📋 Step-by-Step Migration Process

### 1. Update Imports

```tsx
// Add these imports
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
```

### 2. Replace Color Classes

**Find and replace patterns:**

```bash
# Text colors
text-gray-900  →  text-[var(--text-primary)]
text-gray-700  →  text-[var(--text-secondary)]
text-gray-600  →  text-[var(--text-secondary)]
text-gray-500  →  text-[var(--text-muted)]

# Background colors
bg-white       →  bg-[var(--surface)]
bg-gray-50     →  bg-[var(--bg-base)]
bg-indigo-600  →  bg-[var(--primary)]
bg-blue-50     →  bg-[var(--primary-light)]

# Borders
border-gray-300  →  border-[var(--border-base)]
border-gray-200  →  border-[var(--border-light)]
```

### 3. Replace Components

```tsx
// Buttons
<button className="...">  →  <Button variant="...">

// Cards
<div className="bg-white rounded-lg shadow p-6">  →  <Card>

// Inputs
<input className="...">  →  <Input ... />
```

### 4. Update Spacing

```tsx
// Padding
p-4   →  p-[var(--space-md)]
p-6   →  p-[var(--space-lg)]
p-8   →  p-[var(--space-xl)]

// Margins
mb-4  →  mb-[var(--space-md)]
mb-6  →  mb-[var(--space-lg)]
mb-8  →  mb-[var(--space-xl)]

// Gaps
gap-4  →  gap-[var(--space-md)]
gap-6  →  gap-[var(--space-lg)]
```

### 5. Test Both Themes

After migration, test your component in both themes:

```tsx
// In your browser console:
document.documentElement.setAttribute("data-theme", "calm-ocean");
document.documentElement.setAttribute("data-theme", "space-night");
```

---

## 🎯 Common Patterns

### Form Layout

**Before:**

```tsx
<form className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
    <input className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
  </div>
  <button className="w-full bg-indigo-600 text-white py-2 rounded-lg">
    Submit
  </button>
</form>
```

**After:**

```tsx
<form className="space-y-6">
  <Input label="Name" />
  <Button variant="primary" className="w-full">
    Submit
  </Button>
</form>
```

### Grid Layout

**Before:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="font-bold text-gray-900">Title</h3>
  </div>
</div>
```

**After:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Card>
    <h3 className="font-bold text-[var(--text-primary)]">Title</h3>
  </Card>
</div>
```

---

## ⚠️ Common Pitfalls

### ❌ Don't Mix Old and New Styles

**Bad:**

```tsx
<div className="bg-white text-[var(--text-primary)]">
  {/* Mixing old bg-white with new text color */}
</div>
```

**Good:**

```tsx
<div className="bg-[var(--surface)] text-[var(--text-primary)]">
  {/* Consistent use of design tokens */}
</div>
```

### ❌ Don't Hardcode Colors

**Bad:**

```tsx
<div style={{ backgroundColor: "#f7f9fb" }}>
  {/* Won't change with theme */}
</div>
```

**Good:**

```tsx
<div className="bg-[var(--bg-base)]">{/* Theme-aware */}</div>
```

### ❌ Don't Skip Focus States

**Bad:**

```tsx
<button className="... focus:outline-none">{/* Accessibility issue */}</button>
```

**Good:**

```tsx
<Button>{/* Focus states built-in */}</Button>
```

---

## ✅ Migration Checklist

For each component you migrate:

- [ ] Replace hardcoded colors with CSS variables
- [ ] Use component library (Button, Card, Input) where applicable
- [ ] Update spacing to use design tokens
- [ ] Replace border radius with design tokens
- [ ] Update shadow classes
- [ ] Test in both themes (Calm Ocean & Space Night)
- [ ] Verify keyboard navigation works
- [ ] Check color contrast
- [ ] Test with reduced motion enabled
- [ ] Verify mobile responsiveness

---

## 🔍 Finding Components to Migrate

### Search for Old Patterns

Use your editor's search to find:

```
# Background colors
bg-white
bg-gray-
bg-blue-
bg-indigo-

# Text colors
text-gray-
text-blue-
text-indigo-

# Old button patterns
className=".*bg-indigo-600.*text-white

# Old card patterns
className=".*bg-white.*rounded.*shadow
```

---

## 📚 Additional Resources

- [Design System Reference](./DESIGN_SYSTEM_REFERENCE.md)
- [UI Redesign Complete](./UI_REDESIGN_COMPLETE.md)
- [Component Documentation](../web/src/components/ui/README.md)

---

## 💡 Need Help?

If you encounter a pattern not covered here:

1. Check the [Design System Reference](./DESIGN_SYSTEM_REFERENCE.md)
2. Look at migrated examples in:
   - `src/app/page.tsx` (homepage)
   - `src/app/(auth)/login/page.tsx` (login form)
   - `src/app/settings/page.tsx` (settings page)
3. Use CSS variables directly: `var(--variable-name)`

---

_Remember: The goal is sensory-friendly, accessible, and theme-aware design!_ 🌊✨

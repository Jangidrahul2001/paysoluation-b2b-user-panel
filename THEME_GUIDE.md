# Theme Configuration Guide

## 📁 File Location
`src/theme.css`

## 🎨 How to Change Theme Colors

All colors in the application are controlled from **ONE FILE**: `src/theme.css`

### Quick Start - Change Primary Color

To change the main brand color of the entire application:

```css
/* In src/theme.css, find this line: */
--primary-color: #6366f1; /* Current: Indigo */

/* Change to any color you want: */
--primary-color: #f97316; /* Orange */
--primary-color: #3b82f6; /* Blue */
--primary-color: #10b981; /* Green */
--primary-color: #ec4899; /* Pink */
```

**That's it!** The entire application will update automatically.

---

## 🎯 Available Theme Variables

### Primary Brand Colors
```css
--primary-color: #6366f1;        /* Main brand color */
--primary-light: #818cf8;        /* Lighter shade */
--primary-dark: #4f46e5;         /* Darker shade */
```

### Sidebar Theme
```css
--sidebar-bg: #1e1b4b;           /* Sidebar background */
--sidebar-text: #ffffff;         /* Sidebar text color */
--sidebar-active-bg: #6366f1;    /* Active menu item */
```

### Content Area
```css
--content-bg: #f8fafc;           /* Main background */
--content-card-bg: #ffffff;      /* Card backgrounds */
--content-text: #0f172a;         /* Main text color */
```

### Status Colors
```css
--success-color: #10b981;        /* Success messages */
--error-color: #ef4444;          /* Error messages */
--warning-color: #f59e0b;        /* Warning messages */
--info-color: #3b82f6;           /* Info messages */
```

---

## 🔄 How to Use in Components

### Method 1: Direct CSS Variables (Recommended)
```css
/* In your component's style or className */
background-color: var(--primary-color);
color: var(--sidebar-text);
border: 1px solid var(--border-color);
```

### Method 2: Inline Styles
```jsx
<div style={{ 
  backgroundColor: 'var(--primary-color)',
  color: 'var(--content-text)'
}}>
  Content
</div>
```

### Method 3: Utility Classes (Already Created)
```jsx
<div className="bg-primary text-white">
  <button className="bg-success">Success Button</button>
  <span className="text-error">Error Text</span>
</div>
```

---

## 🌈 Pre-made Color Schemes

### Scheme 1: Indigo/Purple (Current)
```css
--primary-color: #6366f1;
--primary-gradient-start: #6366f1;
--primary-gradient-end: #8b5cf6;
--sidebar-bg: #1e1b4b;
```

### Scheme 2: Orange/Pink
```css
--primary-color: #f97316;
--primary-gradient-start: #f97316;
--primary-gradient-end: #ec4899;
--sidebar-bg: #7c2d12;
```

### Scheme 3: Blue/Cyan
```css
--primary-color: #3b82f6;
--primary-gradient-start: #3b82f6;
--primary-gradient-end: #06b6d4;
--sidebar-bg: #0c4a6e;
```

### Scheme 4: Green/Emerald
```css
--primary-color: #10b981;
--primary-gradient-start: #10b981;
--primary-gradient-end: #14b8a6;
--sidebar-bg: #064e3b;
```

---

## 📝 Best Practices

1. **Always use CSS variables** instead of hardcoded colors
2. **Change colors only in `theme.css`** - never in components
3. **Test dark mode** after changing colors
4. **Keep contrast ratios** accessible (WCAG AA minimum)
5. **Update gradients** to match your primary color

---

## 🚀 Quick Theme Change Steps

1. Open `src/theme.css`
2. Find the `:root` section
3. Change `--primary-color` to your desired color
4. Optionally update `--sidebar-bg` to match
5. Save the file
6. The entire app updates automatically!

---

## 🎨 Color Picker Tools

- [Coolors.co](https://coolors.co/) - Generate color palettes
- [Adobe Color](https://color.adobe.com/) - Color wheel
- [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors) - Reference

---

## 💡 Tips

- Use lighter shades for backgrounds
- Use darker shades for text
- Keep sidebar darker than content area
- Maintain consistent color temperature (warm/cool)
- Test with real content before finalizing

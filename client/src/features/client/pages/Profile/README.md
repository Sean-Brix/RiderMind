# Profile Page - Clean & Compact Design

A modern, responsive profile page built with React and Tailwind CSS. Features a minimal design with tight spacing, matte blue gradient header, and efficient two-column layout.

## 📁 File Structure

```
client/src/features/client/pages/Profile/
├── ProfilePage.jsx              # Main profile page component
├── ProfilePage.test.jsx         # Unit tests
├── components/
│   ├── AvatarCard.jsx          # Avatar with name and email
│   ├── InfoCard.jsx            # Information sections grid
│   └── ContactCard.jsx         # Sticky contact sidebar
└── mock/
    └── profileData.js          # Sample profile data
```

## 🎨 Design Features

### Layout
- **Compact header**: 120px height with matte blue gradient (not pink)
- **Overlapping avatar**: 96px circular avatar overlaps banner by ~50%
- **Two-column grid**: Main info (2 cols) + Contact sidebar (1 col, sticky on desktop)
- **Responsive**: Single column on mobile with centered avatar
- **Minimal whitespace**: Tight padding (`py-4`, `px-6`) and margins

### Visual Style
- **Colors**: Matte navy/blue gradient, off-white cards, subtle shadows
- **Typography**: 
  - Headings: `text-lg` bold
  - Labels: `text-xs` uppercase with wide tracking
  - Values: `text-sm` medium weight
- **Shadows**: 6-8px blur, low opacity for modern depth
- **Borders**: `rounded-lg` for all cards

### Components

#### AvatarCard
```jsx
<AvatarCard
  name="Juan Dela Cruz"
  avatarUrl={null}  // Uses initials if null
  role="Student"
  email="juan@example.com"
/>
```

#### InfoCard
```jsx
<InfoCard
  sections={[
    {
      title: 'Personal Information',
      icon: 'user',
      rows: [
        { label: 'First Name', value: 'Juan' },
        { label: 'Last Name', value: 'Dela Cruz' }
      ]
    }
  ]}
/>
```

#### ContactCard
```jsx
<ContactCard
  phone="+63 912 345 6789"
  email="juan@example.com"
  alternateEmail="juan.alt@example.com"
  actions={[
    { label: 'Call', icon: <PhoneIcon />, onClick: handleCall }
  ]}
/>
```

## 🚀 Usage

### Basic Implementation

```jsx
import ProfilePage from './features/client/pages/Profile/ProfilePage';

function App() {
  return <ProfilePage />;
}
```

### With Real Data

Replace the mock data in `ProfilePage.jsx`:

```jsx
import { useProfile } from './hooks/useProfile';

export default function ProfilePage() {
  const { profile, loading } = useProfile();
  
  if (loading) return <LoadingSpinner />;
  
  return (
    // ... use profile data instead of profileData
  );
}
```

## 🎯 Accessibility

- ✅ Semantic HTML (`<h1>`, `<nav>`, etc.)
- ✅ ARIA labels on all buttons
- ✅ Keyboard focus styles
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Screen reader friendly structure

## 📱 Responsive Breakpoints

- **Mobile** (`< 768px`): Single column, centered avatar
- **Tablet** (`≥ 768px`): Two-column grid begins
- **Desktop** (`≥ 1024px`): Sidebar becomes sticky

## 🧪 Testing

Run the included unit tests:

```bash
npm run test ProfilePage.test.jsx
```

Tests cover:
- Avatar rendering with initials
- Edit button functionality
- Contact information display
- Quick action buttons
- Section rendering

## 🎨 Tailwind Config

Add the color palette to your `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      matteBlueStart: '#e1f0ff',
      matteBlueEnd: '#2b6cb0',
      cardBg: '#ffffff',
    }
  }
}
```

See `tailwind.config.snippet.js` for the complete configuration.

## 📝 Customization

### Change Header Gradient

Edit the header `div` in `ProfilePage.jsx`:

```jsx
<div className="relative h-32 bg-gradient-to-r from-purple-100 to-pink-200">
```

### Adjust Avatar Size

In `AvatarCard.jsx`, change the dimensions:

```jsx
<div className="w-32 h-32 rounded-full"> {/* was w-24 h-24 */}
```

### Modify Card Padding

In component files, update padding classes:

```jsx
<div className="p-8"> {/* was p-6 */}
```

## 🔧 Integration Notes

- All components accept a `className` prop for custom styling
- Icons use inline SVG (Heroicons style) - no external dependencies
- Dark mode supported via Tailwind's `dark:` prefix
- No external CSS files required

## 📊 Performance

- Minimal re-renders (uses functional components + hooks)
- No heavy dependencies (pure React + Tailwind)
- Lazy-loadable components
- Optimized for Core Web Vitals

## 🐛 Known Issues

None currently. Report issues via GitHub.

## 📄 License

MIT

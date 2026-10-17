# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

InnovationGuild is a multi-role innovation management platform built with React and Vite. The application serves six distinct user roles: General Users, Innovators, VLEs (Tech Dhaaraks), Affiliated Organizations (AO), Nodal Organizations (NO), and Admins. The project has a complete UI implementation with routing, layouts, and component library, with backend integration pending.

## Tech Stack

- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS v4.1.18 (uses `@theme` directive)
- **Routing**: React Router v7.11.0
- **State Management**: Redux Toolkit 2.11.2
- **HTTP Client**: Axios 1.13.2 (not yet integrated)
- **Forms**: react-select 5.9.0 (React Hook Form 7.69.0 installed but not implemented)
- **Animations**: GSAP 3.14.2
- **Linting**: ESLint 9.39.1

**Note**: TanStack Query (React Query) is installed but not yet implemented. API integration is pending.

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Project Structure

```
src/
├── api/                    # API modules (prepared but empty)
│   ├── admin/, ao/, auth/, common/, innovator/, nodalOrg/, public/, vle/
├── assets/                 # Static assets (fonts, icons, images)
├── components/
│   ├── common/            # Reusable components
│   ├── layout/            # Navbar, Footer, Sidebars
│   └── ui/                # FormSelect, Pagination, Popups, etc.
├── helpers/               # ScrollToTop, useOnClickOutside
├── hooks/                 # Custom hooks (prepared directories: auth/, mutations/, queries/, ui/, utils/)
├── layouts/               # PublicLayout, AdminLayout, AoLayout
├── pages/                 # Page components organized by role
│   ├── admin/            # Admin dashboard pages
│   ├── ao/               # Affiliated Organization pages
│   ├── common/           # Public/shared pages (home, innovations, problems, vles, profiles)
│   └── no/               # Nodal Organization pages (empty, prepared for future)
├── store/                 # Redux store
│   ├── slices/           # authSlice.js (login, logout, role management)
│   └── store.js          # Store configuration
├── utils/                 # Utility functions
│   ├── constants/        # (prepared but empty)
│   ├── LocationData/     # Indian states/districts data
│   └── validation/       # (prepared but empty)
├── App.jsx               # Root component with routing
├── main.jsx              # Application entry point
└── index.css             # Global styles and Tailwind v4 theme
```

**Component Organization Pattern**: Pages contain `_components/` subdirectories for page-specific components.

## Architecture

### Routing

The application uses React Router v7 with three layout-based route groups:

1. **PublicLayout** (`/`) - Public pages: home, innovations, problems, VLEs, profiles, registration, user submissions
2. **AdminLayout** (`/admin/*`) - Admin dashboard with sidebar navigation
3. **AoLayout** (`/ao/*`) - Affiliated Organization dashboard with sidebar navigation

**Important**: No route guards are currently implemented. All routes are accessible without authentication.

### State Management

**Redux Toolkit** is used for client-side state:
- **authSlice**: Manages authentication state (isLoggedIn, userRole, user)
  - Actions: `login()`, `logout()`, `setUserRole()`
  - Selectors: `selectIsLoggedIn`, `selectUserRole`, `selectUser`
  - Located at [src/store/slices/authSlice.js](src/store/slices/authSlice.js)

**TanStack Query** (React Query) is installed but not yet implemented for server state management.

### Authentication (Dev Mode)

The project uses a **developer role selector** in the Navbar for testing:
- Allows switching between roles: VLE, General User, Innovator, AO, NO
- No real authentication implementation yet
- Multi-step registration UI exists but doesn't persist data
- API integration pending

**User Roles**:
- `vle` - VLE (Tech Dhaaraks)
- `general_user` - Just browsing
- `innovator` - Technology providers
- `ao` - Affiliated Organization
- `no` - Nodal Organization (admin rights)

### Form Handling

Forms currently use **controlled components with useState**:

```javascript
const [formData, setFormData] = useState({ /* fields */ })

const handleInputChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }))
}
```

**Custom Form Components**:
- **FormSelect** - Wrapper around react-select with project styling
  - Supports single/multi-select, searchable, creatable options
  - Located at [src/components/ui/FormSelect.jsx](src/components/ui/FormSelect.jsx)
- **FormSelectAndAdd** - Select with dynamic option addition
- **InputTags** - Tag input component

**Location Data**: [src/utils/LocationData/](src/utils/LocationData/) provides Indian states/districts with cascading selection utilities.

**Note**: React Hook Form and Zod are installed but not yet integrated. Forms currently log to console instead of making API calls.

### Styling with Tailwind CSS v4

Custom theme defined in [src/index.css](src/index.css) using the `@theme` directive:

**Fonts**:
- Headings: `--font-heading` (Poppins)
- Body: `--font-body` (Inter)

**Color Palette** (earth tones):
- Backgrounds: `--color-white`, `--color-page`, `--color-light`, `--color-header`
- Text: `--color-primary` (#123E39), `--color-secondary`, `--color-heading`, `--color-muted`
- Buttons: `--color-button-primary` (#A3733E), `--color-button-green` (#5E9E26)
- Accents: `--color-accent-gold`, `--color-accent-brown`, `--color-accent-green`
- Forms: `--color-input-bg` (#ECE8DE), `--color-input-border`

**Custom Utilities**:
- `.container` - Responsive container (max-width: 1280px → 1440px)
- `.pt-navbar` - Navbar spacing utility
- `.form-label` - Form label styling
- `.form-input` - Input/textarea styling with focus states
- `.form-section` - Card-style form sections
- `.form-section-header` - Floating section headers
- `.scrollbar-hide` - Hide scrollbars

### Custom Utilities

**Helpers** ([src/helpers/](src/helpers/)):
- **ScrollToTop.js** - Scrolls to top on route change (used in App.jsx)
- **useOnClickOutside.js** - Hook to detect clicks outside an element (for dropdowns/modals)

**Location Data** ([src/utils/LocationData/](src/utils/LocationData/)):
- `getStateOptions()` - Returns Indian states for select dropdown
- `getDistrictOptions(stateCode)` - Returns districts for selected state
- Includes states.json and districts.json data files

## Code Standards

### ESLint Configuration

[eslint.config.js](eslint.config.js) uses flat config format (ESLint 9+):
- React Hooks rules enforced
- React Refresh rules for HMR
- Custom rule: `no-unused-vars` allows uppercase variable names (pattern: `^[A-Z_]`)

### Component Patterns

**Layout Components** ([src/components/layout/](src/components/layout/)):
- Navbar with responsive mobile menu and profile dropdown
- Role-specific sidebars (AdminSidebar, AoSidebar)
- Footer, ContactSection, CTASection

**UI Components** ([src/components/ui/](src/components/ui/)):
- Reusable form components (FormSelect, InputTags)
- PageHeader with variant support
- Pagination, Filters (SelectFilter, TabFilter)
- Popups (ProfileDropdown, SharePopup, SupportPopup)

**Page Components** follow role-based organization with internal `_components/` for page-specific elements.

## Implementation Status

### ✅ Implemented
- Complete routing structure with role-based layouts
- Redux store with auth slice for role management
- Comprehensive component library (layouts, UI components, forms)
- Responsive design with Tailwind v4 theme
- Location data utilities for Indian states/districts
- Developer authentication simulation for testing
- Multi-step registration UI

### ⏳ Planned (Not Yet Implemented)
- React Query / TanStack Query for server state
- API integration (all api/ directories prepared but empty)
- Real authentication with token management and route guards
- React Hook Form + Zod validation
- Custom hooks (hooks/ directories prepared but empty)

### Development Workflow

When working on forms:
- Follow existing controlled component + useState pattern
- Use FormSelect for dropdowns with project styling
- Forms currently log data to console (API integration pending)

When adding new pages:
- Place in appropriate role directory (admin/, ao/, common/, no/)
- Create `_components/` subdirectory for page-specific components
- Use appropriate layout (PublicLayout, AdminLayout, AoLayout)

When implementing API integration:
- Create API functions in `src/api/<role>/`
- Create React Query hooks in `src/hooks/queries/` or `src/hooks/mutations/`
- Update forms to call API instead of console.log

## Important Notes

- This is a **JavaScript project** (not TypeScript)
- Project uses **ES modules** (`"type": "module"` in package.json)
- Vite config includes both Tailwind and React plugins
- Entry point: [src/main.jsx](src/main.jsx) (referenced in [index.html](index.html))
- GSAP available for complex animations via @gsap/react

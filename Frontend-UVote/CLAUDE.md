# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite)
npm run build      # Production build
npm run lint       # ESLint check
npm run preview    # Preview production build locally
```

No test framework is configured. There is no single-test command.

## Environment

Requires a `.env` file with:
```
VITE_API_URL=<backend base URL>
```

## Architecture

### Stack
React 19 + Vite, React Router 7, Axios, Framer Motion, Recharts, react-easy-crop, react-qr-code.

### Routing (`src/router/AppRouter.jsx`)
All pages are lazy-loaded via `React.lazy()` wrapped in `<Suspense>`. Route types:
- **Public**: Home, About, poll explorer, poll detail, vote confirmation
- **GuestRoute** (redirect if authenticated): Login, Register, VerifyCode
- **ProtectedRoute** (redirect to login if not authenticated): Create/Edit poll, Profile

Legacy `/polls/:id` paths redirect to `/encuestas/:id`.

### Auth (`src/auth/`)
JWT stored in `localStorage` under key `"token"`. User object stored under `"usuario"`. `AuthProvider` initializes from localStorage on mount. `useAuth()` exposes `{ token, usuario, isAuthenticated, login, logout }`. The Axios interceptor in `src/api/axios.js` auto-attaches `Authorization: Bearer` and redirects to `/login` on 401.

### Theme system (`src/context/ThemeContext.jsx`)
Persisted in `localStorage` under `"uv-theme"`, defaults to `prefers-color-scheme`. Sets `data-theme="dark"` on `<html>`. Access via `useTheme()` → `{ theme, toggle }`.

**Dark mode CSS pattern**: Each page/component CSS file has a `[data-theme="dark"]` block at the bottom with overrides. Never modify token values in `theme.css` for per-component needs — add scoped overrides in the component's own CSS file.

**Theme-aware inline colors** (e.g. chart bars, pie segments): CSS can't override inline `style` props, so those components use `useTheme()` to switch color arrays at the JS level. See `MetricsBarChart.jsx`, `MetricsPieChart.jsx`, `PollDetail.jsx` for the pattern.

### CSS architecture (`src/styles/theme.css` + per-page CSS)
Design tokens use `--uv-` prefix. Key token groups:
- **Backgrounds**: `--uv-bg-page`, `--uv-bg-l1/l2/l3` (elevation layers)
- **Text**: `--uv-ink` (primary), `--uv-ink-muted`, `--uv-ink-panel` (always dark `#141412`, used for tooltips/footer)
- **Status badges**: `--uv-badge-open-*`, `--uv-badge-pending-*`, `--uv-badge-closed-*`
- **Danger**: `--uv-danger-color/bg/border`
- **Typography**: base font is `"Times New Roman"` serif (editorial/newspaper style)

Class names use `uv-` prefix throughout. Page-level components use scope classes (e.g. `.uv-polls-scope`, `.uv-profile-scope`) to isolate specificity.

**Specificity rule**: `[data-theme="dark"] .uv-scope .uv-class` (0,3,0) beats `.uv-scope .uv-class` (0,2,0). When a dark override doesn't apply, add the scope class to increase specificity.

### API layer (`src/api/`)
All modules import the shared Axios instance from `src/api/axios.js`. Modules are split by resource: `auth.api.js`, `polls.api.js`, `users.api.js`, `votes.api.js`, `options.api.js`, `campus.api.js`, `pollAuthorizedEmails.api.js`.

### Build output
Vite splits vendor chunks manually: `vendor-react`, `vendor-router`, `vendor-motion`, `vendor-charts`, `vendor-icons`. Deployed on Vercel (`vercel.json` present).

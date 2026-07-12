# AssetFlow Frontend — Enterprise Asset & Resource Management System

AssetFlow is a centralized, modular ERP platform designed to simplify and digitize how organizations track, allocate, and maintain physical assets (equipment, furniture, vehicles) and shared resources (spaces, bookable devices). 

This repository contains the **React + Vite** frontend implementation, designed for high responsiveness, role-based workflows, and a modern aesthetic.

---

## 🚀 Technology Stack

The client-side interface is built using a modern frontend stack:

-   **Core Library:** React 18 (Hooks, Context API)
-   **Build Tooling & Dev Server:** Vite 5
-   **Styling & Design System:** Tailwind CSS 3 (integrated with custom neumorphic / dark-mode themes in `src/index.css`)
-   **Routing:** React Router DOM v6
-   **Data Visualization:** Recharts (responsive bar and line charts for utilization metrics)
-   **Animations:** GSAP (for premium fluid micro-interactions and transitions)
-   **Iconography:** Lucide React

---

## 📂 Directory Layout

```text
frontend/
├── dist/                  # Production builds
├── public/                # Static assets (favicons, manifest)
├── src/
│   ├── auth/              # Screen 1: Sign-In, Sign-Up, Org Registration
│   │   ├── AuthGateway.jsx
│   │   ├── OrgSignUp.jsx
│   │   ├── SignIn.jsx
│   │   ├── SignUp.jsx
│   │   └── Auth.css       # Unified authentication stylesheet
│   ├── components/        # Shared components
│   │   ├── ui/            # UI kit (Modals, Badges, Alerts, PageHeaders)
│   │   └── ThemeToggle.jsx
│   ├── context/
│   │   └── AppContext.jsx # Global State Management (Core ERP business rules)
│   ├── dashboard/
│   │   ├── DashboardLayout.jsx   # Sidebar & Shell
│   │   └── pages/         # Screen 2 to 10
│   │       ├── DashboardOverview.jsx # Screen 2
│   │       ├── OrganizationSetup.jsx # Screen 3 (Admin Only)
│   │       ├── AssetsDirectory.jsx   # Screen 4
│   │       ├── Allocations.jsx       # Screen 5
│   │       ├── ResourceBookings.jsx  # Screen 6
│   │       ├── Maintenance.jsx       # Screen 7
│   │       ├── Audits.jsx            # Screen 8
│   │       ├── Analytics.jsx         # Screen 9
│   │       ├── Notifications.jsx     # Screen 10
│   │       ├── Calendar.jsx          # Resource schedule views
│   │       ├── Tasks.jsx             # Assigned maintenance checksheets
│   │       ├── Team.jsx              # Employee Directory overview
│   │       ├── Settings.jsx          # Settings dashboard
│   │       ├── Help.jsx              # Help desk and FAQ
│   │       └── Logout.jsx            # State cleanup
│   ├── App.jsx            # Application Router
│   ├── index.css          # Design Tokens, Variables & Neumorphic Utility classes
│   └── main.jsx           # Mount entry point
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🛠️ Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Install Dependencies
Navigate to the `/frontend` directory and install the project dependencies:
```bash
npm install
```

### 2. Run the Development Server
Launch the local Vite server:
```bash
npm run dev
```
By default, the application will boot on [http://localhost:5173](http://localhost:5173).

### 3. Build for Production
To bundle the production optimized assets:
```bash
npm run build
```

---

## 🔒 Role-Based Permissions & Workflows

AssetFlow enforces realistic role hierarchies. Role elevations are only managed by an Administrator through the Organization Setup portal.

| Role | Permissions & Workflow Scope |
| :--- | :--- |
| **Admin** | Manages departments, asset categories, registers audit cycles, and promotes employees to Managers/Heads. |
| **Asset Manager** | Registers physical assets, validates condition notes, approves transfer requests, and schedules repairs. |
| **Department Head** | Approves transfer requests within their department, books team resources, and tracks unit inventories. |
| **Employee** | Views individual allocations, reserves shared resources, raises repair tickets, and requests transfers. |

---

## 💻 Mapped Feature Implementations

The interface mirrors the specifications outlined in the problem statement:

### Screen 1: Authenticated Gateway (`/signin` & `/signup`)
-   **Security First:** Standard sign-ups default exclusively to the **Employee** role. Admin access is assigned later.
-   **Organization Registration:** Provides a discrete flow for Admins to register organizations, spawning unique invitation codes.

### Screen 2: Today's Dashboard Overview (`/dashboard`)
-   **Live Operational KPI Metrics:** Displays count indicators for available, allocated, bookable, and repairing assets.
-   **Critical Alerts:** Overdue asset return warnings are separated from routine upcoming returns to flag compliance issues.

### Screen 3: Organization Master Setup (`/dashboard/organization`)
-   **Admin Control Board:** Three tabs mapping:
    1.  *Department Registry:* Setup structures, hierarchy, and heads.
    2.  *Asset Categories:* Customize tags and dynamic category-specific fields.
    3.  *Employee Roster:* Active/Inactive toggles and role promotions.

### Screen 4: Central Asset Directory (`/dashboard/assets`)
-   **Lifecycle State Tracking:** Details lifecycle transitions across: `Available`, `Allocated`, `Reserved`, `Under Maintenance`, `Lost`, `Retired`, and `Disposed`.
-   **Traceability:** Multi-criteria search (tags, serial keys) listing complete assignment histories per asset.

### Screen 5: Allocations & Transfer Conflict Guard (`/dashboard/allocations`)
-   **Conflict Handling:** Prevents double-allocation of a single asset. Attempting to allocate an already assigned asset blocks the action, displays the current holder, and triggers a **Transfer Request** workflow.
-   **Handback Checksheets:** Captures check-in condition feedback (e.g. Excellent, Damaged) during asset returns.

### Screen 6: Resource Slot Bookings (`/dashboard/bookings`)
-   **Overlap Check Engine:** Validates hours and dates. Automatically rejects booking requests that overlap with existing bookings.
-   **Reservations Log:** Details upcoming, ongoing, completed, and canceled slots.

### Screen 7: Maintenance Approval Workflow (`/dashboard/maintenance`)
-   **Lifecycle Locks:** Raising a repair request locks the asset status. Flipped to `Under Maintenance` upon Manager approval and reverts to `Available` only upon resolution.
-   **Support Assignment:** Permits managers to assign specific IT/Facilities technicians directly from the roster.

### Screen 8: Scheduled Inventory Audits (`/dashboard/audits`)
-   **Auditing Cycles:** Runs auditor cycles filtering departments/scopes.
-   **Checksheets:** Auditors log verify status (`Verified`, `Missing`, `Damaged`).
-   **Discrepancy Reporting:** Generates audit discrepancy reviews and locks the database state upon closing.

### Screen 9: Analytics & Reporting (`/dashboard/analytics`)
-   **Interactive Graphs:** Visualizes department allocation rates and maintenance timelines.
-   **Actionable Insights:** Lists most-used resources vs. idle equipment, and retirement candidates.

### Screen 10: Event Notifications (`/dashboard/notifications`)
-   **Alert Registry:** Feeds notification channels about bookings, approvals, transfer statuses, overdue items, and repair clearances.

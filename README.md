# HR Workflow Designer

> A visual HR workflow builder built using **React**, **React Flow**, and **TypeScript**, supporting drag-and-drop nodes, configurable forms, mock APIs, and workflow simulation.

[![Live Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](#) [![Deployment](https://img.shields.io/badge/Deployment-Pending-yellow)](#)

**Deployment:** _[Add Link Here]_  
**Demo Link:** _[Add Link Here]_

---

## 📑 Table of Contents

- [Architecture](#-architecture)
- [How to Run](#-how-to-run)
- [Completed Features](#-completed-features)

---

## 🏗️ Architecture

```
src/
├── components/
│   ├── Canvas/          # React Flow canvas, nodes, forms
│   ├── Sidebar/         # Node palette
│   ├── Sandbox/         # Simulation panel
│   └── Toast/           # Toast notification system
├── context/
│   └── WorkflowContext.tsx
├── hooks/               # Custom React hooks
├── api/
│   ├── client.ts        # Mock API client
│   └── msw/             # MSW handlers
├── utils/               # Graph + validation helpers
├── types/               # TypeScript type definitions
└── main.tsx             # Bootstrap + MSW init
```


##  How to Run

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Access the App

Open your browser and navigate to:

```
http://localhost:5173
```

---

##  Completed Features

###  Core Workflow Builder

| Feature | Status |
|---------|--------|
| Drag-and-drop React Flow canvas | ✅ |
| Custom node types: **Start, Task, Approval, Automated, End** | ✅ |
| Editable node configuration panel with dynamic forms | ✅ |
| Connection creation, deletion, validation, and edge management | ✅ |
| Mini-map, zoom controls, and **Fit View** button | ✅ |
| Node-level validation indicators | ✅ |

###  Automated Actions & API Integration

| Feature | Status |
|---------|--------|
| Mock API via **MSW** | ✅ |
| `GET /automations` - dynamic automation actions | ✅ |
| `POST /simulate` - workflow simulation | ✅ |

###  Simulation / Testing Panel

| Feature | Status |
|---------|--------|
| Workflow validation before simulation | ✅ |
| Error toasts and inline feedback | ✅ |

###  Workflow Authoring Enhancements

| Feature | Status |
|---------|--------|
| Export workflow as JSON | ✅ |
| Import workflow from JSON | ✅ |
| Undo / Redo (state history tracking) | ✅ |
| Auto-Layout (arranges nodes automatically) | ✅ |
| Node Templates (predefined workflows) | ✅ |
| Node Version History (edit history per node) | ✅ |
| Inline error markers on nodes | ✅ |


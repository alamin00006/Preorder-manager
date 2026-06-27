# Preorder Manager

A full-stack preorder management application built with **Next.js 16**, **Prisma**, and **SQLite**.

## Tech Stack

- **Frontend & Backend:** Next.js 16 (App Router + API Route Handlers)
- **ORM:** Prisma
- **Database:** SQLite
- **Styling:** Tailwind CSS
- **UI primitives:** shadcn-style local components
- **Icons:** Lucide React

## Features

- List all preorders with server-side filtering, sorting & pagination
- Filter by status: All / Active / Inactive
- Sort by: Order Number, Customer Name, Product, Price, Quantity, Date
- Toggle Active/Inactive status with instant DB update
- Delete preorders with confirmation
- Row & select-all checkboxes
- Create new preorders
- Edit existing preorders (pre-filled form)
- Backend-generated order numbers in `ORD-YYYYMMDD-000001` format
- Controller / service / model module layering for preorder backend logic
- Loading states and toast notifications
- Empty state UI

## Order Number Format

New preorders are generated on the backend in this format:

```txt
ORD-YYYYMMDD-000001
```

Example: `ORD-20260626-000001`. The final segment is a six-digit daily sequence.

## Prerequisites

- Node.js 18+
- npm

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root (already included):

```env
DATABASE_URL="file:./dev.db"
```

### 3. Database Setup

```bash
npx prisma migrate dev --name init
```

### 4. Seed Sample Data

```bash
npx prisma db seed
```

### 5. Run the App

```bash
npm run dev
```

Open http://localhost:3000 — redirects to /preorders automatically.

---

## Project Structure

```
preorder-manager/
├── app/
│   ├── api/preorders/
│   │   ├── route.ts              # GET list, POST create
│   │   └── [id]/
│   │       ├── route.ts          # GET, PUT, DELETE
│   │       └── status/
│   │           └── route.ts      # PATCH toggle status
│   ├── preorders/
│   │   ├── page.tsx              # List page
│   │   ├── create/page.tsx       # Create page
│   │   └── [id]/edit/page.tsx    # Edit page
├── components/
│   ├── preorder/
│   │   ├── PreorderList.tsx
│   │   ├── PreorderForm.tsx
│   │   ├── StatusBadge.tsx
│   │   └── StatusToggle.tsx
│   └── ui/
│       └── dialog.tsx
├── lib/
│   ├── prisma.ts
│   └── utils.ts
├── modules/
│   └── preorders/
│       ├── preorder.controller.ts
│       ├── preorder.model.ts
│       ├── preorder.service.ts
│       ├── preorder.types.ts
│       ├── preorder.validation.ts
│       ├── preorder.utils.ts
│       └── preorder.constants.ts
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

## API Reference

| Method | Endpoint                                                            | Description     |
| ------ | ------------------------------------------------------------------- | --------------- |
| GET    | /api/preorders?status=all&sortField=createdAt&sortOrder=desc&page=1 | List preorders  |
| POST   | /api/preorders                                                      | Create preorder |
| PUT    | /api/preorders/:id                                                  | Update preorder |
| DELETE | /api/preorders/:id                                                  | Delete preorder |
| PATCH  | /api/preorders/:id/status                                           | Toggle status   |

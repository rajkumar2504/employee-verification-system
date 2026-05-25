# VeriShield Compliance Portal: Background Verification & User Dashboard

A modern, responsive, full-stack Single Page Application (SPA) designed to simulate an enterprise employee background screening and user management system. It provides real-time verification status monitoring, role-based panel control, dynamic searching/filtering, and dark mode features.

---
## 🔐 Split-Screen Login Page

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6180c723-c9e5-484f-8b62-eb81239a448b" />
---

## 📊 Compliance Dashboard (Dark Theme)

<img src="./screenshots/dashboard.png" width="100%" />

---

## 👥 User & Compliance Management

<img src="./screenshots/admin.png" width="100%" />

---

## 🔄 Verification Workflow Stepper

<img src="./screenshots/workflow.png" width="100%" />

---

## 🌙 Dark Mode Dropdown & Theme Settings

<img src="./screenshots/darkmode.png" width="100%" />
## 🚀 Key Features

*   **Secure JWT Authentication**: Role-based access control (RBAC) with secure session storage.
*   **Role-Based Panels**: 
    *   **General User Dashboard**: Access to the main verification table, statistics dashboard, and search features.
    *   **Admin panel (User Management)**: Exclusive rights to register new candidates, edit screening files, adjust user roles, delete records, and audit comments.
*   **Artificial API Delay (2.5s)**: Deliberate async lag on the Node backend to demonstrate custom loaders, table skeleton shimmer animations, and loading states on the frontend.
*   **Zero-Config Local JSON Database**: Fully self-contained file database seeder, ensuring immediate execution without configuring external MongoDB Atlas credentials.
*   **Premium Responsive UI**: Built with Angular Material elements, custom CSS gradient backgrounds, smooth shadow elevations, and glassmorphism styling.
*   **Dynamic Theme Toggle**: Instantly switch between custom Light and Dark modes.
*   **Toast Notifications**: Interactive snackbars displaying operation feedbacks (success, credentials mismatch, unauthorized accesses).

---

## 🛠️ Technology Stack

*   **Frontend**: Angular 21 (NgModule-based, CSS layouts), Angular Material UI, RxJS, Angular Router, Reactive Forms
*   **Backend**: Node.js, Express, TypeScript, JSON Web Tokens (JWT), BcryptJS
*   **Database**: Local file-based JSON database with automatic seeder

---

## 🔑 Demo Account Credentials

You can use these credentials to log in and test different authorization levels:

| User ID | Password | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `admin` | `admin123` | **Admin** | Full read/write access (Can manage records and update statuses) |
| `user` | `user123` | **General User** | Read-only access (Can search and view statistics) |

---

## ⚙️ Folder Structure

The project has been organized with a clean, modular structure:

```
employee-verification-system/
│
├── backend/                       # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── controllers/           # Login & CRUD Controllers
│   │   ├── middleware/            # JWT Auth & Role Authorization
│   │   ├── routes/                # API Endpoints (/login, /users)
│   │   ├── models/                # User & Verification Interfaces
│   │   ├── data/                  # db.ts (Mock JSON DB wrapper) & users.json (Auto-seeded)
│   │   ├── app.ts                 # Express Application Setup
│   │   └── server.ts              # Entry Boot Server
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                      # Angular 17+ Frontend (restructured)
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/              # Login Component & AuthService
│   │   │   ├── dashboard/         # Stats Grid, Candidate Table & Filter Search
│   │   │   ├── admin/             # User Management Panels & Add/Edit Forms
│   │   │   ├── services/          # ThemeService (Dark Mode) & UserService (API caller)
│   │   │   ├── guards/            # AuthGuard & AdminGuard
│   │   │   ├── models/            # Shared TypeScript models
│   │   │   ├── shared/            # Navbar, Sidebar, and Skeleton Loader Components
│   │   │   ├── app-routing-module.ts # Route declarations
│   │   │   ├── app-module.ts      # Main module, imports, and declarations
│   │   │   ├── app.ts             # Root App class
│   │   │   └── app.html           # Root layout shell
│   │   ├── index.html             # Index loader (Includes Outfit & Roboto Google Fonts)
│   │   └── styles.css             # CSS Theme variables (Light / Dark) & Material overrides
│   ├── angular.json               # Angular CLI Configurations
│   ├── package.json               # Angular Dependencies & Scripts
│   └── tsconfig.json              # Frontend TS compiler specs

```

---

## 🏁 Installation & Launch Guide

Follow these steps to run both the backend server and frontend application locally:

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/en/) (v18.0.0 or higher recommended)
*   [npm](https://www.npmjs.com/) (usually bundled with Node)

---

### 2. Running the Backend Server
1.  Open a terminal window and navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Install the required dependencies:
    ```bash
    npm install
    ```
3.  Start the TypeScript development server in watch mode:
    ```bash
    npm run dev
    ```
    *The server will initialize `backend/src/data/users.json` with seed data automatically if it does not exist.*
    *The API will listen on:* **`http://localhost:5000`**

---

### 3. Running the Frontend Angular Application
1.  Open a separate terminal window and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install the frontend package dependencies:
    ```bash
    npm install
    ```
3.  Launch the local development server:
    ```bash
    npm run start
    ```
4.  Open your browser and navigate to:
    **`http://localhost:4200`**

---

## 🛡️ API Documentation

All request payloads should use `application/json` format. Protected endpoints require the `Authorization: Bearer <JWT_TOKEN>` header.

| Method | Endpoint | Access Level | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/login` | Public | Authenticates credentials and returns a signed JWT token + user details. |
| **GET** | `/users` | Authenticated | Fetches all verification records (with a 2.5s delay). |
| **POST** | `/users` | Admin Only | Creates a new user record/screening file. |
| **PUT** | `/users/:id` | Admin Only | Modifies details or verification status of an existing candidate. |
| **DELETE**| `/users/:id` | Admin Only | Deletes a screening record (Cannot self-delete logged-in admin). |

# Employee Management System - Frontend

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The frontend client for the **Employee Management System**, built with React 19, Vite, and Bootstrap 5 to provide a modern, responsive user interface for administrative employee management.

> **Architecture Note:** This application is built as a **decoupled single-page application (SPA)**. It communicates with the backend via asynchronous HTTP requests (`Axios`), ensuring a clean separation of concerns and independent client-side routing (`React Router`).

---

## 🛠️ Tech Stack & Key Libraries

* **Core Library:** React 19
* **Build Tool & Dev Server:** Vite 7 (configured for local dev on port `3000`)
* **Routing:** React Router DOM v7
* **HTTP Client:** Axios (for API requests to the Java/Spring Boot backend)
* **Styling & Components:** Bootstrap 5
* **Linting & Code Quality:** ESLint

---

## 🔗 Decoupled API Integration

This frontend communicates with the **Spring Boot Backend REST API**.

* **Default Local API Base URL:** `http://localhost:8080/api/employees`
* **Backend Repository:** [Employee Management System - Backend](https://github.com/JesseHerrera04/ems-backend)

### Handled API Endpoints
* **`GET /api/employees`** – Fetches and displays the complete list of employees in a responsive data table.
* **`GET /api/employees/{id}`** – Pre-populates the employee form when editing an existing record.
* **`POST /api/employees`** – Submits new employee data entered via the registration form.
* **`PUT /api/employees/{id}`** – Submits updated employee information.
* **`DELETE /api/employees/{id}`** – Removes an employee record with immediate UI state update.

---

## ⚙️ Prerequisites & Installation

* **Node.js** (v18 or newer recommended)
* **npm** (comes packaged with Node.js)

### Setup Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JesseHerrera04/ems-frontend.git
   cd ems-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   *The application will open automatically or be accessible at `http://localhost:3000`.*

---

## 📜 Available Scripts

In the project directory, you can run:

* `npm run dev` – Starts the Vite development server on port `3000`.
* `npm run build` – Bundles the app into static files for production deployment.
* `npm run preview` – Serves the production build locally for testing.
* `npm run lint` – Runs ESLint to check for code quality and syntax issues.

---

## 🚀 Running the Full Stack Locally

To test full end-to-end functionality:
1. Ensure the **[Spring Boot Backend](https://github.com/JesseHerrera04/ems-backend)** is running locally on port `8080` (using either the MySQL or H2 database profile).
2. Start this React client with `npm run dev` on port `3000`.
3. Open `http://localhost:3000` in your browser to interact with the system.

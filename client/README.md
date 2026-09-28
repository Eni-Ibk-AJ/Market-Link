# MarketLink - Frontend Client

Welcome to the frontend repository for **MarketLink**, a desktop-first MERN stack e-commerce and logistics platform designed to bridge the gap between local farmers, agricultural vendors, and consumers.

---

## 🚀 Tech Stack

* **Framework:** React (powered by Vite for ultra-fast builds and hot module replacement)
* **Routing:** React Router for client-side navigation and role-based portal views
* **Mapping:** Leaflet & React-Leaflet (for interactive, zero-cost location markers and market mapping)
* **HTTP Client:** Axios (configured with centralized base URLs and token interceptors)
* **Styling:** Custom CSS with a polished green, cream, and orange aesthetic reflecting agricultural freshness

---

## 🌟 Key Features & Architecture

* **Role-Based Access Control (RBAC):** Distinct dashboards tailored for Customers, Farmers, Vendors, and Administrators, securing sensitive routes and actions.
* **Interactive Leaflet Mapping:** Dynamic map integration displaying local markets, pickup points, and address details without requiring paid API billing keys.


* **Dynamic Product Catalog:** Real-time fetching of market listings, categories, and inventory items directly from the backend API.
* **Responsive Desktop-First Design:** Optimized layouts providing clear navigation, clean data tables, and structured grids.

---

## 📁 Project Structure

```text
client/
├── public/              # Static assets and icons
├── src/
│   ├── assets/          # Images, logos, and design assets
│   ├── components/      # Reusable UI elements (Navbar, Modals, Leaflet Map components)
│   ├── pages/           # Main views (Home, Products, Dashboards, Checkout)
│   ├── services/        # Centralized Axios configuration and API call handlers
│   ├── App.jsx          # Root component containing route definitions
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global theme styles (green/cream/orange palette)
├── .env                 # Environment variables configuration
├── package.json         # Client dependencies and scripts
└── vite.config.js       # Vite build and server configurations (ported to localhost:3000)

```

---

## 🛠️ Getting Started & Setup

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/?utm_source=gemini) installed on your machine.

### Installation

1. Navigate to the client directory:
```bash
cd client

```


2. Install the required dependencies:
```bash
npm install

```



### Running the Development Server

To launch the development server on **port 3000** (matching your configuration setup):

```bash
npm run dev -- --port 3000

```

Open [http://localhost:3000](http://localhost:3000?utm_source=gemini) in your browser to view the application.

### Building for Production

To bundle the frontend for production deployment:

```bash
npm run build

```

---

## 🔗 Backend Integration

The client communicates seamlessly with the Express/Node.js backend via Axios services. Ensure your local environment variables (`.env`) point correctly to either your local server or your live Render backend (`[https://the-marketlink-90jp.onrender.com](https://the-marketlink-90jp.onrender.com)`).

---
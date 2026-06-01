<div align="center">

# ✨ Stockly - Premium Real-time Inventory & Analytics Dashboard ✨

> 📊 Where Precision Tracking Meets Intelligent Analytics

[![React](https://img.shields.io/badge/React-19.2.6-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=20232A)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=20232A)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100.0-009688?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=20232A)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white&labelColor=20232A)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=20232A)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white&labelColor=20232A)](https://www.docker.com/)

---

</div>

## ✨ Features

- 📈 **Dynamic Dashboard Analytics**: Real-time sales, purchases, and expenses analytics rendered in beautiful interactive charts (Recharts).
- 📦 **Smart Product Management**: Effortlessly track products, prices, stock levels, product ratings, and SKU numbers, with base64 image uploading support.
- 👥 **Customer & User Directory**: Clean tabular representations of customer and administrator directories using Material-UI DataGrid.
- 🛒 **Advanced Order Lifecycle**: Integrated order management detailing purchase list quantities, timestamps, and customer relations.
- 💸 **Expense Categorization**: Comprehensive expense lists sorted by categories (e.g. Office, Sales) with rich visual analytics.
- 🌓 **Premium Settings & Styling**: Beautiful modern UI built using Tailwind CSS v4, custom layouts, and custom theme management.
- 🐳 **Containerized Setup**: Fully Dockerized backend, frontend, and database services for frictionless local development.

---

<div align="left">

### Prerequisites
- Node.js (v18 or higher)
- Python (3.11 or higher)
- Docker Desktop (Optional, for containerized run)
- PostgreSQL (Optional, or cloud PG like Neon DB)

</div>

### 1. Clone the Repository
```bash
git clone https://github.com/exploreradi/inventory.git
cd inventory
```

### 2. Backend Setup (FastAPI & SQLAlchemy)
```bash
# Navigate to server directory
cd server

# Create and activate Python virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file in the server directory
touch .env

# Add the following environment variable to .env:
DATABASE_URL=postgresql://user:password@localhost:5432/inventorydb
```

#### Backend Environment Variables Explanation
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URI (Local or Neon DB Cloud) | `postgresql://username:password@ep-wispy-sunset.neon.tech/neondb?sslmode=require` |

```bash
# Seed the database with mock records (optional)
python seed.py

# Start the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

### 3. Frontend Setup (React + Vite + TailwindCSS v4)
```bash
# Open a new terminal
# Navigate to client directory
cd client

# Install packages
npm install

# Create .env file in the client directory
touch .env

# Add the following environment variable to .env:
VITE_API_BASE_URL=http://localhost:8000

# Start the development server
npm run dev
```

#### Frontend Environment Variables Explanation
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend URL for API calls | `http://localhost:8000` |

### 4. Access the Services Locally
- **Frontend Dashboard**: `http://localhost:5173`
- **FastAPI OpenAPI Swagger**: `http://localhost:8000/docs`
- **API Health Check**: `http://localhost:8000/health`

---

## 🐳 Docker Deployment & Containerization

This application is fully containerized with **Docker** and **Docker Compose**, orchestrating the PostgreSQL Database, the FastAPI backend, and the React client through an Nginx proxy.

### Local Multi-Container Run
To launch the entire stack (Database, Backend, and Frontend) instantly with one command:
```bash
# From the root directory:
docker compose up --build
```
- **React Client**: Accessible at `http://localhost:3000`
- **FastAPI Server**: Accessible at `http://localhost:8000`
- **PostgreSQL Database**: Port `5432` mapped locally

> **Pro-Tip**: By default, Docker Compose spins up a local PostgreSQL container. If you wish to use your remote cloud database (like Neon DB), simply update `DATABASE_URL` in `docker-compose.yml` under the `backend` service and comment out/remove the `db` service.

### Building & Pushing Production Images
To build a production image for the backend:
```bash
# Build the Docker image locally
docker build -t exploreradi/inventory-backend:latest ./server

# Push to Docker Hub / Registry
docker push exploreradi/inventory-backend:latest
```

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-19.2.6-61DAFB?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0.12-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3.0-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-9.0.1-007FFF?style=flat-square&logo=mui&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.12.0-764ABC?style=flat-square&logo=redux&logoColor=white)

### Backend & Database
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100-009688?style=flat-square&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-red?style=flat-square&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)

</div>

---



## 📝 License

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

</div>

## 🙏 Acknowledgment

<div align="center">

| Resource | Description |
|----------|-------------|
| [Material UI](https://mui.com/) | Powerful pre-built React components |
| [Recharts](https://recharts.org/) | Composable chart library for React |
| [FastAPI](https://fastapi.tiangolo.com/) | Modern high-performance web framework |
| [Lucide Icons](https://lucide.dev/) | Clean, beautiful SVG icons |

</div>

---

<div align="center">

### Contributed with ❤️ by [ExplorerAditya]
Last Updated: June 2026

</div>

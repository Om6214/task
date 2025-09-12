# 🎓 School Payments & Dashboard

A full-stack school payments and dashboard application built with **Node.js/Express backend** and **React/Vite frontend**.

---

## 📂 Project Structure

.
├── school-payments-backend/ # Node.js + Express + MongoDB
├── school-dashboard-frontend/ # React + Vite + TailwindCSS

makefile
Copy code

---

## ⚙️ Environment Setup

### Backend Environment Variables
Create `school-payments-backend/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

PG_KEY=your_payment_gateway_key
PAYMENT_API_KEY=your_payment_api_key
SCHOOL_ID=your_school_id

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
SIGN=your_signature_key
Frontend Environment Variables
Create school-dashboard-frontend/.env:

env
Copy code
VITE_API_URL=http://localhost:5000
🚀 Local Development
Backend Setup
bash
Copy code
cd school-payments-backend
npm install
npm run dev
Frontend Setup
bash
Copy code
cd school-dashboard-frontend
npm install
npm run dev
🐳 Docker Deployment
Pull Images
bash
Copy code
# Backend
docker pull om6214/school-payments-backend:latest

# Frontend
docker pull om6214/school-dashboard-frontend:latest
Run Containers
bash
Copy code
# Backend
docker run -d \
  --name backend \
  --env-file ./school-payments-backend/.env \
  -p 5000:5000 \
  om6214/school-payments-backend:latest

# Frontend
docker run -d \
  --name frontend \
  -e VITE_API_URL=http://localhost:5000 \
  -p 3000:80 \
  om6214/school-dashboard-frontend:latest
🐳 Docker Compose (Optional)
Create docker-compose.yaml:

yaml
Copy code
version: "3"
services:
  backend:
    image: om6214/school-payments-backend:latest
    env_file:
      - ./school-payments-backend/.env
    ports:
      - "5000:5000"

  frontend:
    image: om6214/school-dashboard-frontend:latest
    environment:
      - VITE_API_URL=http://localhost:5000
    ports:
      - "3000:80"
Run with:

bash
Copy code
docker-compose up -d
🌐 Access Points
Backend API: http://localhost:5000

Frontend App: http://localhost:3000

📋 Prerequisites
Node.js (v14 or higher)

MongoDB

Docker (optional, for containerized deployment)

Payment gateway credentials
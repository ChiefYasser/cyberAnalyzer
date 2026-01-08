# 🛡️ CyberWatch  
**Cybersecurity Log Analysis Platform (NoSQL – MongoDB)**

---

## 📌 Overview

**CyberWatch** is a simple cybersecurity monitoring and log analysis platform built as a **school project**.  
It focuses on collecting, storing, visualizing, and analyzing security-related logs using **MongoDB (NoSQL)**.

The project detects **basic cyberattack patterns** such as **Brute Force attacks** and **DDoS-like behaviors**, **without using Artificial Intelligence**, in order to better understand **core cybersecurity concepts and log analysis fundamentals**.

---

## 🎯 Project Goals

The main objectives of this project are:

- 📚 Learn **NoSQL database integration** using **MongoDB**
- 🔐 Understand **cybersecurity log analysis fundamentals**
- 🧠 Detect common attacks using **rule-based logic**
- 🏗️ Build a **clear, modular, and scalable architecture**
- 🧪 Simulate realistic cybersecurity events for testing
- 📊 Visualize logs, alerts, and incidents in a web dashboard

---

## 🧩 Key Features

### 🔍 Log Management
- Centralized collection of security logs
- Storage in MongoDB for scalability and flexibility
- Support for different log types (authentication, network, system)

### 🚨 Attack Detection (Rule-Based)
- Brute force detection (multiple failed login attempts)
- DDoS-like detection (high request rate from same source)
- Alert generation based on thresholds

### 📊 Dashboard & Visualization
- View logs in real time
- Display alerts and incidents
- Weekly security report generation (PDF)

### 🧪 Fake Simulation Module
- Generates realistic fake security logs
- Simulates attacks and normal behavior
- Helps test detection logic without real attacks

---

## 🏗️ System Architecture

[ Fake Simulation ]
↓
[ MongoDB Database ]
↓
[ Backend API (Express.js) ]
↓
[ Frontend Dashboard (Next.js) ]



---

## 🧠 Technology Stack

### 🔧 Backend

| Technology | Description |
|-----------|------------|
| Node.js | JavaScript runtime for backend development |
| Express.js | Web framework for building REST APIs |
| MongoDB | NoSQL database for storing logs and users |
| Mongoose | ODM for MongoDB (schemas & models) |
| bcryptjs | Password hashing for authentication |
| JWT (jsonwebtoken) | Secure authentication using tokens |
| dotenv | Environment variable management |
| Nodemailer | Email notifications (optional) |

---

### 🎨 Frontend

| Technology | Description |
|-----------|------------|
| Next.js | React framework with routing & SSR |
| React | Component-based UI library |
| Tailwind CSS | Utility-first CSS framework |
| Lucide React | Icon library |
| Axios | HTTP client for API communication |
| Framer Motion | UI animations |
| jsPDF | Client-side PDF generation |
| jspdf-autotable | PDF tables for reports |

---

### 🧪 Fake Simulation (`fake_sim`)

| Technology | Description |
|-----------|------------|
| Node.js | Runtime for simulation scripts |
| Express.js | Optional API for simulation |
| MongoDB | Stores simulated logs |
| Mongoose | Database interaction |
| Faker.js | Generates realistic fake data |
| Nodemon | Auto-restart during development |

---

## 📁 Project Structure

yberWatch/
│
├── backend/
│ ├── controllers/
│ ├── routes/
│ ├── models/
│ ├── middleware/
│ └── server.js
│
├── frontend/
│ ├── app/
│ ├── components/
│ ├── utils/
│ └── styles/
│
├── fake_sim/
│ ├── simulator.js
│ └── config/
│
└── README.md


---

## 🔐 Authentication Flow

1. User registers or logs in
2. Password is hashed using **bcrypt**
3. Server generates a **JWT token**
4. Token is stored client-side
5. Protected routes require valid JWT

---

## 📊 Reporting

- Weekly security reports generated as **PDF**
- Includes:
  - User activities
  - Logs summary
  - Detected incidents
  - Alerts overview
- Downloadable directly from the frontend

---

## 🚀 Installation & Setup

### Backend

cd backend
npm install
npm run dev


Frontend
cd frontend
npm install
npm run dev

Fake Simulation
cd fake_sim
npm install
node simulator.js

---

⚠️ Limitations

❌ No AI / Machine Learning (by design)

❌ Basic detection logic only

❌ Not production-ready

❌ No real-time IDS integration

🧠 Learning Outcomes

Through this project, the following skills are developed:

NoSQL database design (MongoDB)

REST API development

Cybersecurity fundamentals

Log analysis concepts

Full-stack project structuring

PDF reporting

Simulation-based testing

📌 Future Improvements

Role-based access control (Admin / Analyst)

Real-time WebSocket updates

Advanced detection rules

Visualization charts

Deployment (Vercel / Render / Docker)


![WhatsApp Image 2026-01-06 at 13 14 10](https://github.com/user-attachments/assets/39b636e5-809f-43ae-ba38-c40bd86eb0dd)

This prototype represents an early-stage foundation for a future intelligent cybersecurity monitoring platform integrating automation, AI-driven analysis, and real-time threat detection. And an automatate version that generates rappots weekly using n8n 

<img width="1497" height="630" alt="image" src="https://github.com/user-attachments/assets/c2dcd924-b4fd-49b9-9d12-c631811d2e22" />


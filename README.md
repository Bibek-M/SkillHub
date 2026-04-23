# 🚀 SkillHub

SkillHub is a full-stack web application that enables users to share, discover, and manage skills within a community. It is designed as a peer-to-peer learning platform where users can showcase their skills and connect with others.

---

## 🌐 Live Demo

* 🔗 Frontend: https://skill-hub-six-tan.vercel.app
* 🔗 Backend: https://skillhub-awyt.onrender.com

---

## 🛠️ Tech Stack

### Frontend

* React (Vite)
* Axios
* Tailwind CSS (if used)

### Backend

* Node.js
* Express.js
* JWT Authentication

### Database

* PostgreSQL (Neon)

### Deployment

* Frontend: Vercel
* Backend: Render
* Database: Neon

---

## ✨ Features

* 🔐 User Authentication (Signup / Login)
* 👤 Role-based system (Admin / Student)
* 📋 Dashboard to view all skills
* ➕ Add new skills
* 🧑‍🤝‍🧑 Peer-to-peer learning platform
* 🌐 Fully deployed (Frontend + Backend + DB)

---

## 📁 Project Structure

```bash
SkillHub/
│
├── src/              # React frontend
├── public/           # Static assets
├── server/           # Backend (Node.js + Express)
├── .env              # Environment variables (not committed)
└── package.json
```

---

## ⚙️ Environment Variables

### Frontend (.env)

```env
VITE_API_URL=https://skillhub-awyt.onrender.com
```

---

### Backend (.env)

```env
DATABASE_URL=your_neon_database_url
JWT_SECRET=your_secret_key
PORT=3000
```

---

## 🚀 Getting Started (Local Setup)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Bibek-M/SkillHub.git
cd SkillHub
```

---

### 2️⃣ Install dependencies

#### Frontend

```bash
npm install
```

#### Backend

```bash
cd server
npm install
```

---

### 3️⃣ Run the project

#### Start backend

```bash
npm run server
```

#### Start frontend

```bash
npm run dev
```

---

## 🔗 API Endpoints

### Auth

* POST `/signup`
* POST `/signin`

### Skills

* POST `/createSkill`
* GET `/api/dashboard`

---

---

## 📌 Future Improvements

* 💬 Real-time chat (Socket.io / WebRTC)
* 🔔 Notification system
* 📊 Admin analytics dashboard
---

## 🧠 Learning Outcomes

* Full-stack development (React + Node + PostgreSQL)
* REST API design
* Authentication using JWT
* Deployment using Vercel, Render, Neon
* Debugging real-world production issues

---
---

## 📄 License

This project is open-source and available under the MIT License.

---

## 👨‍💻 Author

**Bibek M**

* GitHub: https://github.com/Bibek-M



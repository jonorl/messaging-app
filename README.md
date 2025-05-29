# 📝 Messaging app (monorepo)

A messaging application built with **Node.js**, **Express** and **PostgreSQL**. Developed as part of [The Odin Project's Node.js curriculum](https://www.theodinproject.com/lessons/nodejs-messaging-app), this app demonstrates full-stack capabilities including authentication, real-time communication, and structured database interactions via **Prisma ORM**.

## 🚀 Features

- User registration and authentication
- PostgreSQL database integration via Prisma
- Secure password handling (hasing + salting)  with bcrypt
- Timestamps for messages
- Profile customisation
- Image attachments
- Basic group chat functionality
- Display of online users
- Real time *simulation* 

## 🧱 Tech Stack

### Backend
- **Node.js**
- **Express.js**
- **PostgreSQL**
- **Prisma ORM**
- **dotenv**
- **bcrypt/uuid**
- **Multer middleware**
- **JWT strategy**
- **CORS**

### Frontend libraries
- **React**
- **Tailwind**
- **Shadcn/UI**
- **Lucide-react**

## 📁 Project Structure

```
messaging-app/
│
├── server/               # Express backend
│   ├── assets/           # Image folder
│   ├── controllers/      # Middleware folder
│   ├── db/               # Prisma/SQL queries
│   ├── routes/           # Route definitions
│   ├── prisma/           # Prisma schema and migrations
│   ├── utils/            # Helper js functions
│   ├── app.js            # Express app setup
│   └── .env              # Environment variables
│
├── client/               # React + Tailwind + Shadcn/UI frontend
│
└── README.md             # Project overview
```

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma CLI](https://www.prisma.io/)

### Setup (Backend)

```bash
# Clone the repo
git clone https://github.com/jonorl/messaging-app.git
cd messaging-app

# Navigate to backend
cd server

# Install dependencies
npm install

# Set up database and run migrations
npx prisma migrate dev --name init

# Start the server
node --watch app.js
```

Server runs at: `http://localhost:3000`

### Setup (frontend)

```bash
# Navigate to frontend
cd client

# Install dependencies
npm install

# Start the client
npm run dev
```

### Setup (database)

```bash
# Initiate db
npx prisma migrate dev --name init
```

Client runs at: `http://localhost:5173`

# Add Robot (optional, but good for testing)
```sql
INSERT INTO "User" (
  id,
  email,
  name,
  profilePicture,
  passwordHash,
  createdAt
) VALUES (
  '8d7118e1-0f6c-466c-9c17-e7c8bc42af8e',
  'robot@messaging.com',
  'Robot',
  '/assets/shodan.png',
  '$2b$10$9LRDo5nLio4zVN6XTyp4JOrLpU.guTWlW8TEkuVelPK0RN5TtW2jC',
  NOW()
);
```

### .env file (backend)
```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"
JWT_SECRET="yourSecretWord"
PORT="3000"
ROBOT="8d7118e1-0f6c-466c-9c17-e7c8bc42af8e"
```

### .env file (frontend)
```bash
VITE_LOCALHOST=http://localhost:3000
```

🚀 Deployment

* Frontend: Netlify --> https://message-app-top.netlify.app/
* Backend: Render --> https://messaging-app-g6s5.onrender.com/
* PostgreSql: Neon --> https://neon.tech/

## 🧱 To-do

- Image Uploading: Support for uploading and hosting images using services like Cloudinary
- Group Chat Enhancements: Group titles, admin roles, and better user management
- Message editing and deletion support

## 👨‍💻 Author

**Jonathan Orlowski**
*[GitHub](https://github.com/jonorl)
*[LinkedIn](https://www.linkedin.com/in/jonathan-orlowski-58910b21/)

> 📚 This project is part of [The Odin Project](https://www.theodinproject.com/), a free and open-source curriculum for aspiring full-stack web developers.
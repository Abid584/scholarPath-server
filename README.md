<div align="center">

# ⚙️ Scholar Path — Server

### REST API powering the Scholar Path platform

[![Node.js](https://img.shields.io/badge/Runtime-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Framework-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)

[**🌐 Live API**](https://scholar-stream-server-nine.vercel.app/) · [**Client Repository**](https://github.com/hasnatfahmidkhan/scholar-stream)

</div>

---

## 📋 Table of Contents 

- [Overview](#-overview)
- [Tech Stack](#️-tech-stack)
- [Key Features](#-key-features)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Data Structure](#-data-structure)
- [Dependencies](#-dependencies)
- [Contact](#-contact)

---

## 📖 Overview

This is the backend infrastructure powering **Scholar Path**. The API handles user authentication, scholarship listings, application workflows, and administrative analytics — all served through Node.js using static, in-memory data rather than a connected database.

---

## 🛠️ Tech Stack

| Layer              | Technology                                        |
| :------------------ | :-------------------------------------------------|
| **Runtime**          | Node.js                                            |
| **Framework**         | Express.js                                         |
| **Data Layer**         | Static JSON datasets served directly via Node.js  |
| **Authentication**      | JWT (JSON Web Tokens) with HttpOnly cookies       |
| **Environment Config**   | Dotenv                                            |

> **Note:** This version of the server does not connect to an external database or payment provider — all scholarship, user, and application data is served from static datasets bundled with the application.

---

## ✨ Key Features

- **🛡️ Secure Authentication** — JWT issued with `httpOnly`, `secure`, and `sameSite` cookie attributes for robust session management
- **👮 Role-Based Access Control (RBAC)** — custom middleware (`verifyToken`, `verifyAdmin`, `verifyModerator`) gates access to protected routes
- **🔒 Super Admin Protection** — dedicated logic prevents deletion or demotion of the primary admin account (`isProtected: true`)
- **📈 Built-In Analytics** — derives revenue, top-university, and category-popularity insights directly from the static dataset
- **🔍 Public Data APIs** — lightweight endpoints serve home page statistics, top-rated reviews, and partner university listings without authentication

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/hasnatfahmidkhan/scholar-stream-server.git
cd scholar-stream-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root with the following keys:

```env
PORT=5000
JWT_SECRET=your_secure_random_string
NODE_ENV=development
DOMAIN_URL=http://localhost:5173
```

### 4. Run the server

```bash
# Production
npm start

# Development (with Nodemon)
npm run dev
```

---

## 📡 API Endpoints

### 🔐 Auth & Users

| Method | Endpoint            | Description                  | Access |
| :----- | :------------------- | :----------------------------- | :------ |
| POST   | `/getToken`           | Generate JWT & set cookie     | Public |
| POST   | `/logout`              | Clear cookie                  | Public |
| POST   | `/users`               | Register new user             | Public |
| GET    | `/users`               | Get all users                 | Admin  |
| PATCH  | `/users/role/:id`       | Promote/demote user           | Admin  |
| DELETE | `/users/:id`            | Delete user (protected check) | Admin  |

### 🎓 Scholarships

| Method | Endpoint              | Description                       | Access  |
| :----- | :--------------------- | :----------------------------------- | :-------- |
| GET    | `/scholarships`         | Get all (search, filter, sort)      | Public  |
| GET    | `/scholarship/:id`       | Get details & recommendations       | Private |
| POST   | `/add-scholarship`       | Create new scholarship              | Admin   |
| PATCH  | `/scholarship/:id`        | Update scholarship                  | Admin   |
| DELETE | `/scholarship/:id`         | Delete scholarship                  | Admin   |

### 📝 Applications

| Method | Endpoint                       | Description                          | Access     |
| :----- | :------------------------------ | :--------------------------------------| :----------- |
| POST   | `/applications`                  | Submit a new application             | Student    |
| GET    | `/applications`                   | Get all applications                 | Moderator  |
| GET    | `/applications/:email/byUser`      | Get my applications                  | Student    |
| PATCH  | `/applications/feedback/:id`        | Give feedback                        | Moderator  |
| PATCH  | `/applications/:id`                  | Update status (Pending/Completed)    | Moderator  |

### 🏠 Public Home APIs

| Method | Endpoint              | Description                       | Access |
| :----- | :--------------------- | :----------------------------------- | :------- |
| GET    | `/home-stats`            | Counts (users, reviews, funds)      | Public |
| GET    | `/top-universities`       | Unique universities list            | Public |
| GET    | `/top-reviews`              | 5-star reviews for slider           | Public |

### 📊 Admin Analytics

| Method | Endpoint     | Description                            | Access |
| :----- | :------------ | :----------------------------------------| :------- |
| GET    | `/analytics`    | Application & engagement chart data    | Admin  |

---

## 📂 Data Structure

Since the server no longer connects to an external database, data is organized as static datasets and served through dedicated Node.js modules:

| Dataset           | Key Fields                                                      |
| :------------------ | :----------------------------------------------------------------|
| **users**            | `name`, `email`, `role`, `isProtected`                          |
| **scholarships**       | `universityName`, `fees`, `deadline`, `category`, `benefits[]`  |
| **applications**         | `userId`, `scholarshipId`, `applicationStatus`                |
| **reviews**                | `rating`, `comment`, `userImage`, `scholarshipId`            |
| **wishlists**                 | `userId`, `scholarshipId`                                 |

---

## 📦 Dependencies

```json
"dependencies": {
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.2"
}
```

---

## 📞 Contact

**Developed by Abid Ali**

<div align="center">

If you found this project useful, consider giving it a ⭐ on GitHub!

</div>

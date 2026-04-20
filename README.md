# 🚀 Peerly — Real-Time Campus Collaboration Platform

Peerly is a full-stack backend system designed to foster collaboration, competition, and knowledge-sharing within a campus community. It enables students to participate in skill-based challenges, seek academic help, and track performance through a unified real-time leaderboard.

---

## 🎯 Problem Statement

In most college environments:

* Talent is scattered and not easily discoverable
* Students struggle to find timely academic help
* There is no unified platform combining **competition + collaboration**

👉 Peerly solves this by creating a **single ecosystem for learning, competing, and growing together**.

---

## 🧩 Core Features

### 🔐 Authentication & Security

* User registration and login
* JWT-based authentication
* Secure API access using Spring Security
* Role-based access (extensible)

---

### 🏆 Challenge Arena

* Create and manage challenges (coding, design, etc.)
* Submit entries (text/media via Cloudinary)
* Voting system for submissions
* Automatic phase transitions:

  * Open → Voting → Closed
* Points awarded to top performers

---

### ⚡ Real-Time Voting (WebSockets)

* Live vote updates without refresh
* Real-time leaderboard updates
* Built using STOMP over WebSocket

---

### 💬 Academic Help Board

* Post academic doubts/questions
* Threaded replies from peers
* Accept best answer (StackOverflow-style)
* Reputation points awarded to helpers

---

### 📊 Unified Leaderboard

* Combines:

  * Challenge performance
  * Help board contributions
* Dynamic ranking system
* Supports filtering (future scope)

---

### 📤 Media Upload Support

* Integrated with Cloudinary
* Supports images/audio submissions
* Scalable media handling

---

## 🏗️ System Architecture

```
Client (Postman / Frontend)
        ↓
Spring Boot Backend
        ↓
Service Layer (Business Logic)
        ↓
Repository Layer (JPA/Hibernate)
        ↓
PostgreSQL Database
```

---

## 🛠️ Tech Stack

### Backend

* Java 17
* Spring Boot
* Spring Security + JWT
* Spring Data JPA (Hibernate)

### Database

* PostgreSQL

### Real-Time

* WebSockets (STOMP protocol)

### Media Handling

* Cloudinary

### Build Tool

* Maven

---

## 📂 Project Structure

```
src/
 ├── main/
 │   ├── java/com/vrithi/campus_platform/
 │   │   ├── controller/
 │   │   ├── service/
 │   │   ├── repository/
 │   │   ├── entity/
 │   │   ├── security/
 │   │   ├── config/
 │   │   └── dto/
 │   │
 │   └── resources/
 │       ├── application.properties (ignored)
 │       └── application-example.properties
 │
 └── test/
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```
git clone https://github.com/YOUR_USERNAME/peerly.git
cd peerly
```

---

### 2. Configure Environment

Copy:

```
application-example.properties → application.properties
```

Fill in your credentials:

```
spring.datasource.password=YOUR_DB_PASSWORD
cloudinary.api-key=YOUR_API_KEY
jwt.secret=YOUR_SECRET
```

---

### 3. Run the Application

```
mvn spring-boot:run
```

Server runs on:

```
http://localhost:8080
```

---

## 🔌 Key API Endpoints

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`

### Challenges

* `POST /api/challenges`
* `GET /api/challenges`

### Submissions

* `POST /api/submissions`
* `GET /api/submissions/{challengeId}`

### Help Board

* `POST /api/help`
* `POST /api/help/reply`

### Leaderboard

* `GET /api/leaderboard`

---

## ⚡ Real-Time Features

* Live vote count updates
* Instant leaderboard refresh
* Real-time notifications for replies

---

## 🔐 Security Features

* Stateless authentication using JWT
* Password encryption using BCrypt
* Secure API endpoints with role control

---

## 📈 Future Improvements

* Redis caching for leaderboard performance
* Rate limiting for API protection
* Pagination & filtering for scalability
* Deployment (Railway + Vercel)
* Frontend (React + Tailwind)
* Notifications system (async processing)

---

## 🧠 Key Learnings

* Designed a layered backend architecture
* Implemented real-time systems using WebSockets
* Built secure authentication using JWT
* Integrated third-party services (Cloudinary)
* Managed relational data using JPA/Hibernate

---

## 💼 Resume Description

Built **Peerly**, a real-time campus collaboration platform using Spring Boot, PostgreSQL, JWT, and WebSockets, enabling challenge-based competitions, academic help threads, and live leaderboard updates.

---

## 👨‍💻 Author

Vrithi

---

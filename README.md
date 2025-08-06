# VideoTube Backend

A full-featured backend API for a video-sharing platform inspired by YouTube.  
Built with Node.js, Express, and MongoDB, featuring JWT authentication, video & playlist management, subscriptions, comments, tweets, likes, and more.

---

## Table of Contents

- [Features](#features)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
- [API Overview](#api-overview)  
- [Folder Structure](#folder-structure)    
- [Contributing](#contributing)  
- [Contact](#contact)  

---

## Features

- User registration, login, logout, and JWT-based authentication  
- Video CRUD operations with metadata and comments  
- Tweet creation, update, deletion, and retrieval  
- Like toggling on videos and tweets  
- Playlist creation, updating, and video management within playlists  
- User subscriptions and channel subscriber management  
- Rate limiting middleware to prevent abuse  
- Input validation with express-validator  
- Secure routes with JWT and role-based access controls  
- Watch history aggregation and dashboard statistics  

---

## Tech Stack

- Node.js  
- Express.js  
- MongoDB with Mongoose ODM  
- JSON Web Tokens (JWT)  
- express-validator for request validation  
- Rate limiting middleware  
- Multer for file uploads  
- Cloudinary for video/image hosting (if applicable)  

---

## Getting Started

### Prerequisites

Make sure you have the following installed and set up on your machine:

- **Node.js** (version 16 or higher) — 
[Download](https://nodejs.org/)  

- **MongoDB** — either locally installed or a cloud database like 
[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)  

- **Cloudinary account** if you want to use cloud media storage — 
[Sign up](https://cloudinary.com/)

---

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/alihazzem/VideoTube-Backend.git
   cd videotube-backend

2. **Install dependencies**

    ```bash
    npm install

---

### Configuration

1. **Copy the sample environment variables file and update it**

    ```bash
    cp .env.sample .env

2. **Open .env and replace the placeholder values with your own**

    MongoDB connection URL
    JWT secret keys
    Cloudinary credentials
    Rate limiting settings

3. **Running the Server**

    ```bash
    npm run dev
    note: The backend API will be running at: http://localhost:4000

---

## API Overview

Key endpoints include:

**/api/users** — User registration, login, profile management, avatar upload

**/api/videos** — Upload, update, delete, and fetch videos

**/api/tweets** — Create, update, delete, and fetch tweets

**/api/likes** — Toggle likes on videos and tweets

**/api/playlists** — Create, update, and manage playlists

**/api/subscriptions** — Subscribe to and unsubscribe from channels

**/api/comments** — Add, update, and delete comments on videos

**/api/dashboard** — Retrieve channel stats and video analytics

For detailed API documentation, see the [API Docs](https://documenter.getpostman.com/view/47128147/2sB3BDHqeN).

> ⚠️ Note: Dashboard API routes are implemented, but the frontend dashboard is not yet built.


---

## Folder Structure

    /controllers            # Route handlers and business logic
    /models                 # Mongoose schemas
    /db                     # Database connection and initialization
    /middlewares            # Auth, rate limiter, validation, error handlers
    /routes                 # Express route definitions
    /validators             # Request validation schemas
    /utils                  # Utility functions and helpers
    /config                 # Configuration and environment setup

---

## Contributing

Contributions are welcome! Feel free to open issues or pull requests.

---

## Contact

Ali Hazem – alihazzem5@gmail.com
Project Link: [https://github.com/alihazzem/VideoTube-Backend]




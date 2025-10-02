# 🏋️‍♂️ MeFit — Fitness Tracking Application

MeFit is a full-stack fitness tracking application designed to help users set fitness goals, track their workouts, and monitor their progress.  
It comes with **secure authentication, personalized workout routines, progress tracking, and goal management** features.

--- 

## 👥 Team Members
- Seelam Lahari  
- Gurram Sairam  
- Kommalapati Madhulasya  
- Kandibanda Koushik  
- Moturi Mounika  
- Challa Chaitanya  

---

## ⚙️ Tech Stack
**Frontend:**
- React.js  
- Tailwind CSS  
- Netlify Deployment  

**Backend:**
- Node.js + Express  
- MongoDB + Mongoose  
- JWT Authentication  
- Swagger API Documentation  

---

## 📖 Features
- 🔐 **User Authentication** (Register/Login with JWT)  
- 👤 **Profile Management** (view/update user profile)  
- 🎯 **Fitness Goals** (create and track personal goals)  
- 🏃 **Workout Tracking** (create workouts with exercises and duration)  
- 💪 **Exercise Library** (fetch predefined exercise sets)  
- 📊 **Progress Monitoring** (track progress towards goals)  

---
## 📑 API Documentation

The API is documented using **Swagger**.  
Once the backend is running, visit:

👉 [http://localhost:5000/docs](http://localhost:5000/docs)

### Example Endpoints:
- **POST** `/api/user/register` → Register a new user  
- **POST** `/api/user/login` → Login and receive JWT token  
- **GET** `/api/profile` → Fetch user profile (requires JWT)  
- **POST** `/api/goal` → Create a new fitness goal  
- **GET** `/api/workout` → Get all workouts  
- **GET** `/api/exercise` → Get list of exercises

 ---
 
## 🛠️ Installation Instructions

Follow these steps to run the project locally:

## 🛠️ Installation Instructions

```bash
# 1. Clone the repositories

# Clone frontend
git clone https://github.com/chaitanya641/mefit_frontend.git
cd mefit_frontend

# Clone backend (if in a separate repo)
git clone <your-backend-repo-link>
cd backend

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
# Create a .env file in your backend folder with the following:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# NODE_ENV=development

# 4. Run Backend
npm start

# 5. Run Frontend
cd mefit_frontend
npm start
---



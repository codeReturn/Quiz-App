# Quiz Application

## Description

The **Quiz Application** is a full-stack web platform that allows users to create, manage, and participate in quizzes. Users can register and log in using JWT authentication. The platform supports customizable quizzes with multiple question types, leaderboards, bonuses, and privacy controls. The app also features a dashboard displaying the latest and most popular quizzes.

## Tech Stack

- **Frontend:** React
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** JWT

## Features

### 🔑 Authentication

- User registration & login with JWT authentication.

### 📋 Quiz Management

- Users can create quizzes with:
  - **Title, Description, and Cover Image**
  - **Custom Questions** (with support for images and multiple answer types: input, radio, or checkbox for multiple correct answers)
  - **Question Settings:**
    - ✅ Maximum points per question
    - ⏳ Quiz duration
    - 🔒 Public or Private access
    - 📅 End Date for quiz availability
  - **🎁 Bonus System:** Additional points awarded for completing the quiz before a specified time.

### 🎮 Quiz Participation

- Users can play quizzes multiple times.
- Each quiz has a **🏆 Leaderboard** that records the best attempts.

### ⚙️ Quiz Administration

- Quiz creators can:
  - ❌ Close quizzes
  - 📩 Invite friends (for private quizzes)
  - 🗑️ Delete quizzes
  - 🔄 Reset the leaderboard

### 📊 Dashboard & Search

- The dashboard displays:
  - 🆕 Latest quizzes
  - 🔥 Most popular quizzes
- A separate page lists all quizzes with a **🔍 search function** to filter by name.

## 🚀 Installation

### Prerequisites

Ensure you have the following installed:

- 🟢 Node.js (>=14.x)
- 🗄️ PostgreSQL (latest version recommended)

### Backend Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/codeReturn/Quiz-App.git
   cd quiz-application
   ```
2. Install dependencies:
   ```sh
   cd backend
   npm install
   ```
3. Configure the database:
   - Create a `.env` file in the `backend` directory and add:
     ```ini
     DATABASE_URL="postgresql://user:password@localhost:5432/quizdb"
     JWT_SECRET="your_secret_key"
     ```
   - Run Prisma migrations:
     ```sh
     npx prisma migrate dev
     ```
4. Start the backend server:
   ```sh
   npm run dev
   ```

### Frontend Setup

1. Navigate to the `frontend` folder:
   ```sh
   cd ../frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file and specify the backend API URL:
   ```ini
   VITE_BACKEND_URL=http://localhost:5000
   ```
4. Start the frontend:
   ```sh
   npm start
   ```

## 📌 Usage

- 📝 Sign up or log in to access the quiz functionalities.
- 🎨 Create and customize quizzes.
- 🏅 Play quizzes and appear on leaderboards.
- ⚙️ Manage quizzes (invite, close, delete, reset leaderboard).
- 🔍 Discover new quizzes via the dashboard or search feature.

## 🤝 Contributing

Feel free to submit pull requests or report issues.

## 📜 License

MIT License


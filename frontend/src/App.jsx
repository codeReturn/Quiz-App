import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './stores/userStore';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQuiz from './pages/CreateQuiz';
import Quiz from './pages/Quiz';
import Play from './pages/Play';
import Quizes from './pages/Quizes';

import { ToastContainer, Bounce } from 'react-toastify';

import LoadingSpinner from './components/helpers/LoadingSpinner';

function App() {
  const { token, logout, loadUser, fetchUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  let routes;

  if(token) {
    routes = (
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-quiz" element={<CreateQuiz />} />
        <Route path="/quiz/:id" element={<Quiz />} />
        <Route path="/play/:id" element={<Play />} />
        <Route path="/quizes" element={<Quizes />} />
        <Route
            path="*"
            element={<Navigate to="/" replace />}
        />
      </Routes>
    )
  } else {
    routes = (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
            path="*"
            element={<Navigate to="/" replace />}
        />
      </Routes>
    )
  }

  // AUTH
  let logoutTimer;
  const storedData = JSON.parse(localStorage.getItem('userData') || '{}');

  useEffect(() => {
    if (storedData && storedData.token && storedData.expirationDate) {
      const remainingTime = new Date(storedData.expirationDate).getTime() - new Date().getTime();
      logoutTimer = setTimeout(() => logout(), remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [storedData.token, storedData.expirationDate]);

  useEffect(() => {
    if (storedData && storedData.token && new Date(storedData.expirationDate) > new Date()) {
      loadUser()
      fetchUser()
    }
  }, [storedData.token]);


  return (
    <div className="main">
      <ToastContainer 
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
      />

      <BrowserRouter>
        <div className="full-screen"></div>
        <main>
          {isLoading ? (
            <LoadingSpinner asOverlay={true} />
          ) : routes}
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;

import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/login.jsx"
import Register from "./pages/register"
import AllBooks from './pages/AllBooks';
import Community from './pages/Community';
import MyLibraryPage from './pages/MyLibraryPage';  
import Home from "./pages/home"
import Dashboard from "./pages/Dashboard"
import NotFound from "./pages/notfound"
import Profile from "./pages/Profile"
import BookDetails from "./pages/BookDetails"
import ProtectedRoute from "./components/ProtectedRoute"

function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path= "/community" element={<Community/>} />
        <Route path="/all-books" element={<AllBooks />} />
        <Route path="/my-library" element={<MyLibraryPage />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route path="/details/:google_id" element={<BookDetails />} /> {/* ✅ */}
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App


import { Navigate, Route, Routes } from "react-router-dom"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import Profile from "@/pages/Profile"
import Projects from "@/pages/Projects"
import ProjectDetails from "@/pages/ProjectDetails"
import Tasks from "@/pages/Tasks"
import TimeLogs from "@/pages/TimeLogs"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/projects/:id" element={<ProjectDetails />} />
      <Route path="/tasks" element={<Tasks />} />
      <Route path="/timelogs" element={<TimeLogs />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App

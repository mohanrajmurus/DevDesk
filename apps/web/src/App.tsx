import { Navigate, Route, Routes } from "react-router-dom"
import Landing from "@/pages/Landing"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import Profile from "@/pages/Profile"
import Projects from "@/pages/Projects"
import ProjectDetails from "@/pages/ProjectDetails"
import Tasks from "@/pages/Tasks"
import TimeLogs from "@/pages/TimeLogs"
import { RequireAuth, RedirectIfAuthed } from "@/components/RequireAuth"

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RedirectIfAuthed>
            <Landing />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <Login />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <Profile />
          </RequireAuth>
        }
      />
      <Route
        path="/projects"
        element={
          <RequireAuth>
            <Projects />
          </RequireAuth>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <RequireAuth>
            <ProjectDetails />
          </RequireAuth>
        }
      />
      <Route
        path="/tasks"
        element={
          <RequireAuth>
            <Tasks />
          </RequireAuth>
        }
      />
      <Route
        path="/timelogs"
        element={
          <RequireAuth>
            <TimeLogs />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

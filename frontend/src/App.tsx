import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Shell from "./components/Shell";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Tutor from "./pages/Tutor";
import SignIn from "./pages/SignIn";
import Manage from "./pages/Manage";

function Protected({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  if (!ready)
    return <div className="loading-screen">Preparing your learning space…</div>;
  return user ? children : <Navigate to="/signin" replace />;
}

export default function App() {
  return <Routes>
    <Route path="/signin" element={<SignIn />} />
    <Route element={<Protected><Shell /></Protected>}>
      <Route index element={<Dashboard />} />
      <Route path="/courses" element={<Courses />} />
      <Route path="/courses/:courseId" element={<CourseDetail />} />
      <Route path="/tutor" element={<Tutor />} />
      <Route path="/manage" element={<Manage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}

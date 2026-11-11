import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext.jsx";
import Shell from "./components/Shell.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Courses from "./pages/Courses.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import Tutor from "./pages/Tutor.jsx";
import SignIn from "./pages/SignIn.jsx";
import Manage from "./pages/Manage.jsx";

function Protected({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="loading-screen">Preparing your learning space…</div>;
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

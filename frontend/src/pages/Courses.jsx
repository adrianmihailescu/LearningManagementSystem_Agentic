import { Search, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api from "../api.js";
import CourseCard from "../components/CourseCard.jsx";
import Notice from "../components/Notice.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

const categories = ["All courses", "Data Science", "Web Development", "Design", "Computer Science", "Cloud Computing"];
export default function Courses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [mine, setMine] = useState([]);
  const [category, setCategory] = useState("All courses");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    Promise.all([api.get("/courses"), api.get("/courses/mine")])
      .then(([all, own]) => { setCourses(all.data.courses); setMine(own.data.courses); })
      .catch((error) => setNotice(error.response?.data?.error || "Could not load courses."));
  }, []);
  const filtered = useMemo(() => courses.filter((course) =>
    (category === "All courses" || course.category === category)
    && `${course.title} ${course.description} ${course.tags?.join(" ")}`.toLowerCase().includes(search.toLowerCase())),
  [courses, category, search]);
  async function enroll(course) {
    try {
      await api.post(`/courses/${course._id}/enroll`);
      const { data } = await api.get("/courses/mine");
      setMine(data.courses);
      setNotice("");
    } catch (error) { setNotice(error.response?.data?.error || "Could not enroll in this course."); }
  }
  return <div className="catalog-page">
    <Notice message={notice} onClose={() => setNotice("")} />
    <div className="catalog-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> THE COURSE LIBRARY</div><h1>Find your next <em>favorite.</em></h1><p className="page-subtitle">Good things happen when you stay curious. See what speaks to you.</p></div><div className="catalog-note"><Sparkles size={17} /><span>Made for your<br /><b>next chapter</b></span></div></div>
    <div className="catalog-toolbar"><div className="category-tabs">{categories.map((item) => <button key={item} className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div><label className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a course…" /></label></div>
    <div className="catalog-results"><span>{filtered.length} thoughtfully made {filtered.length === 1 ? "course" : "courses"}</span><span>Sorted for your curiosity <span className="sort-glyph">↕</span></span></div>
    {filtered.length ? <div className="course-grid catalog-grid">{filtered.map((course) => {
      const enrolled = mine.find((item) => item._id === course._id);
      return <CourseCard key={course._id} course={course} progress={enrolled?.progress} onEnroll={enroll} canEnroll={user.role === "student"} />;
    })}</div> : <div className="empty-state"><div className="empty-icon"><Search /></div><h3>No courses found</h3><p>Try a different search or category.</p></div>}
  </div>;
}

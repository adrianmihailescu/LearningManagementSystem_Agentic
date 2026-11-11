import { ArrowRight, BookOpen, Clock3, Sparkles, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "../api";
import { useCurrentUser } from "../auth/AuthContext";
import CourseCard from "../components/CourseCard";
import Notice from "../components/Notice";
import type { Course } from "../interfaces/course";
import type { CourseListResponse } from "../interfaces/api";

export default function Dashboard() {
  const user = useCurrentUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [catalog, setCatalog] = useState<Course[]>([]);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<CourseListResponse>("/courses/mine"),
      api.get<CourseListResponse>("/courses"),
    ])
      .then(([mine, all]) => { setCourses(mine.data.courses); setCatalog(all.data.courses); })
      .catch((error: unknown) => setNotice(getApiErrorMessage(error, "Could not load your learning dashboard.")))
      .finally(() => setLoading(false));
  }, []);

  async function enroll(course: Course) {
    try {
      await api.post(`/courses/${course._id}/enroll`);
      setNotice("");
      const { data } = await api.get<CourseListResponse>("/courses/mine");
      setCourses(data.courses);
    } catch (error: unknown) { setNotice(getApiErrorMessage(error, "Could not enroll in this course.")); }
  }

  return <div className="dashboard-page">
    <Notice message={notice} onClose={() => setNotice("")} />
    <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR LEARNING, IN FOCUS</div><h1>Good morning, {user.name.split(" ")[0]}<span className="wave"> ✨</span></h1><p className="page-subtitle">A little progress today goes a long way. Ready to pick up where you left off?</p></div><Link to="/tutor" className="primary-button"><Sparkles size={17} /> Ask your AI tutor</Link></section>
    <section className="hero-panel"><div className="hero-copy"><span className="hero-label"><span className="hero-label-dot" /> YOUR NEXT BIG IDEA STARTS HERE</span><h2>Make room for<br /><em>what’s next.</em></h2><p>Keep learning at your own pace. Your next breakthrough is just one lesson away.</p><Link to="/courses" className="hero-button">Explore your courses <ArrowRight size={16} /></Link></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="hero-spark">✦</div><div className="hero-glow" /><div className="hero-book"><BookOpen size={52} strokeWidth={1.2} /></div><span className="hero-float float-one">keep growing ↗</span><span className="hero-float float-two">one step at a time</span></div><div className="hero-count">01 <span>/ 03</span></div></section>
    <section className="stat-grid">
      <div className="stat-card"><div className="stat-icon purple"><BookOpen size={18} /></div><div><span>Courses in progress</span><strong>{courses.length.toString().padStart(2, "0")}</strong></div><div className="stat-trend"><TrendingUp size={14} /> Keep it up</div></div>
      <div className="stat-card"><div className="stat-icon orange"><Target size={18} /></div><div><span>Lessons completed</span><strong>{courses.reduce((n, c) => n + (c.completedLessons?.length || 0), 0).toString().padStart(2, "0")}</strong></div><div className="stat-trend"><span className="trend-dot" /> Your pace</div></div>
      <div className="stat-card"><div className="stat-icon blue"><Clock3 size={18} /></div><div><span>Learning streak</span><strong>07 <small>days</small></strong></div><div className="stat-trend"><span className="trend-dot" /> Nice rhythm</div></div>
    </section>
    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">KEEP THE MOMENTUM</span><h2>Pick up where you left off</h2></div><Link to="/courses" className="text-link">View all courses <ArrowRight size={15} /></Link></div>
      {loading ? <div className="loading-state">Loading your learning space…</div> : courses.length ? <div className="course-grid">{courses.slice(0, 3).map((course) => <CourseCard key={course._id} course={course} progress={course.progress} />)}</div> : <div className="empty-state"><div className="empty-icon"><BookOpen /></div><h3>Your next chapter is waiting</h3><p>Explore the catalog and find a course that sparks your curiosity.</p><Link to="/courses" className="primary-button">Browse courses <ArrowRight size={16} /></Link></div>}
    </section>
    <section className="section-block recommended-block"><div className="section-heading"><div><span className="eyebrow">CURATED FOR CURIOUS MINDS</span><h2>Explore something new</h2></div><Link to="/courses" className="text-link">Browse catalog <ArrowRight size={15} /></Link></div>
      {loading ? null : <div className="course-grid">{catalog.filter((course) => !courses.some((own) => own._id === course._id)).slice(0, 3).map((course) => <CourseCard key={course._id} course={course} onEnroll={enroll} canEnroll={user.role === "student"} />)}</div>}
    </section>
  </div>;
}

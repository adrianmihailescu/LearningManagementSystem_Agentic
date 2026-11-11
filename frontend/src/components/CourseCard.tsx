import type { CSSProperties } from "react";
import { ArrowUpRight, Clock3, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import type { Course } from "../types";

const artwork: Record<string, { symbol: string; label: string; gradient: string }> = {
  "Data Science": { symbol: "✳", label: "THINK IN PATTERNS", gradient: "art-data" },
  "Web Development": { symbol: "JS", label: "BUILD FOR THE WEB", gradient: "art-code" },
  Design: { symbol: "◉", label: "DESIGN WITH INTENTION", gradient: "art-design" },
  "Computer Science": { symbol: "⌘", label: "IDEAS INTO ALGORITHMS", gradient: "art-computer" },
  "Cloud Computing": { symbol: "☁", label: "SCALE WHAT YOU BUILD", gradient: "art-cloud" },
};

interface CourseCardProps {
  course: Course;
  progress?: number;
  onEnroll?: (course: Course) => void;
  canEnroll?: boolean;
}

export default function CourseCard({ course, progress, onEnroll, canEnroll = true }: CourseCardProps) {
  const art = artwork[course.category] || artwork["Data Science"];
  const artStyle: CSSProperties & { "--course-color": string } = {
    "--course-color": course.coverColor || "#6338d5",
  };
  return <article className="course-card">
    <Link to={`/courses/${course._id}`} className={`course-art ${art.gradient}`} style={artStyle}>
      <span className="art-kicker">{course.category}</span><span className="art-symbol">{art.symbol}</span><span className="art-label">{art.label}</span><span className="art-open"><ArrowUpRight size={17} /></span>
    </Link>
    <div className="course-body">
      <div className="course-meta"><span className="level-pill">{course.level}</span><span><Clock3 size={13} /> {course.lessonCount || course.modules?.reduce((n, m) => n + m.lessons.length, 0) || 0} lessons</span></div>
      <Link to={`/courses/${course._id}`} className="course-title">{course.title}</Link>
      <p className="course-description">{course.description}</p>
      <div className="tag-row">{(course.tags || []).slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
      {progress !== undefined ? <div className="course-progress"><div className="progress-caption"><span>Your progress</span><b>{progress}%</b></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><Link className="course-action" to={`/courses/${course._id}`}><Play size={14} fill="currentColor" /> Continue learning</Link></div>
        : canEnroll && onEnroll
          ? <button className="course-action course-enroll" onClick={() => onEnroll(course)}><Sparkles size={15} /> Enroll in course</button>
          : <Link className="course-action" to={`/courses/${course._id}`}><Sparkles size={15} /> Explore course</Link>}
    </div>
  </article>;
}

import { ArrowLeft, ArrowRight, CheckCircle2, FileText, PlayCircle, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../api.js";
import Notice from "../components/Notice.jsx";
import { useAuth } from "../auth/AuthContext.jsx";

export default function CourseDetail() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [notice, setNotice] = useState("");
  const [quizResult, setQuizResult] = useState(null);
  const [assignmentDrafts, setAssignmentDrafts] = useState({});
  const lessons = useMemo(() => course?.modules.flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleId: module._id, moduleTitle: module.title }))) || [], [course]);
  const [activeId, setActiveId] = useState("");
  useEffect(() => {
    api.get(`/courses/${courseId}`).then(({ data }) => {
      setCourse(data.course); setEnrollment(data.enrollment);
      setActiveId(data.course.modules[0]?.lessons[0]?._id || "");
    }).catch((error) => setNotice(error.response?.data?.error || "Could not load this course."));
  }, [courseId]);
  const activeLesson = lessons.find((lesson) => lesson._id === activeId);
  async function enroll() {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      const { data } = await api.get(`/courses/${courseId}`);
      setEnrollment(data.enrollment);
      setNotice("");
    } catch (error) { setNotice(error.response?.data?.error || "Could not enroll in this course."); }
  }
  async function markComplete() {
    try {
      const { data } = await api.post(`/courses/${courseId}/progress`, { lessonId: activeId });
      setEnrollment((current) => ({ ...current, completedLessons: data.completedLessons }));
      setNotice("");
    } catch (error) { setNotice(error.response?.data?.error || "Could not save your lesson progress."); }
  }
  async function submitQuiz(event, module) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const answers = module.quiz.map((_, index) => Number(form.get(`q-${index}`)));
    try {
      const { data } = await api.post(`/courses/${courseId}/quiz/${module._id}/submit`, { answers });
      setQuizResult(data);
      setNotice("");
    } catch (error) { setNotice(error.response?.data?.error || "Could not submit this quiz."); }
  }
  async function submitAssignment(event, module, assignment) {
    event.preventDefault();
    const answer = assignmentDrafts[assignment._id] || "";
    try {
      const { data } = await api.post(`/courses/${courseId}/assignment/${module._id}/${assignment._id}/submit`, { answer });
      setEnrollment((current) => ({
        ...current,
        assignmentSubmissions: [
          ...(current.assignmentSubmissions || []).filter((item) => item.assignmentId !== assignment._id),
          data.submission,
        ],
      }));
      setNotice("");
    } catch (error) { setNotice(error.response?.data?.error || "Could not submit your assignment."); }
  }
  if (!course) return <div className="loading-state">{notice || "Loading course…"}</div>;
  const complete = enrollment?.completedLessons?.includes(activeId);
  return <div className="lesson-page"><Notice message={notice} onClose={() => setNotice("")} />
    <Link to="/courses" className="back-link"><ArrowLeft size={16} /> Back to courses</Link>
    <div className="lesson-header"><div><div className="eyebrow">{course.category} <span className="eyebrow-separator">/</span> {course.level}</div><h1>{course.title}</h1><p>{course.description}</p></div><div className="lesson-header-badge"><Sparkles size={17} /> Learn at your pace</div></div>
    {!enrollment && user.role === "student" ? <div className="enroll-banner"><div><strong>Ready to get started?</strong><span>Enroll to save your progress and unlock lesson tools.</span></div><button className="primary-button" onClick={enroll}>Enroll in course <ArrowRight size={16} /></button></div> : null}
    <div className="lesson-layout"><aside className="lesson-sidebar"><div className="lesson-sidebar-heading">COURSE CONTENT <span>{lessons.length} lessons</span></div>{course.modules.map((module, index) => <div key={module._id} className="module-group"><div className="module-title"><span className="module-number">{String(index + 1).padStart(2, "0")}</span>{module.title}</div>{module.lessons.map((lesson) => <button key={lesson._id} className={`lesson-nav-item ${activeId === lesson._id ? "active" : ""}`} onClick={() => setActiveId(lesson._id)}><span className="lesson-state">{enrollment?.completedLessons?.includes(lesson._id) ? <CheckCircle2 size={15} /> : <PlayCircle size={15} />}</span><span>{lesson.title}</span></button>)}</div>)}</aside>
      <div className="lesson-content">{activeLesson ? <article className="lesson-article"><div className="lesson-type"><FileText size={14} /> {activeLesson.type} lesson <span>·</span> {activeLesson.durationMinutes} min</div><h2>{activeLesson.title}</h2><div className="lesson-copy">{activeLesson.content.split("\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>{activeLesson.codeExample && <pre className="code-sample"><code>{activeLesson.codeExample.replaceAll("\\n", "\n")}</code></pre>}{activeLesson.resourceUrl && <a className="text-link" href={activeLesson.resourceUrl} target="_blank" rel="noreferrer">Open learning resource <ArrowRight size={14} /></a>}<div className="lesson-footer"><span>{complete ? "You’ve completed this lesson" : "Every lesson is a step forward"}</span><button className={complete ? "completed-button" : "primary-button"} disabled={complete || !enrollment} onClick={markComplete}>{complete ? <><CheckCircle2 size={16} /> Completed</> : <>Mark as complete <ArrowRight size={16} /></>}</button></div></article> : <p>This course is being prepared. Check back soon.</p>}
        {course.modules.filter((module) => module.quiz?.length).map((module) => <section key={module._id} className="quiz-panel"><div className="eyebrow">KNOWLEDGE CHECK</div><h3>{module.title} quiz</h3><form onSubmit={(event) => submitQuiz(event, module)}>{module.quiz.map((question, index) => <fieldset key={question._id}><legend>{question.prompt}</legend>{question.options.map((option, optionIndex) => <label key={optionIndex} className="quiz-option"><input type="radio" name={`q-${index}`} value={optionIndex} required /> {option}</label>)}</fieldset>)}<button className="primary-button" disabled={!enrollment || user.role !== "student"}>Submit answers <ArrowRight size={15} /></button></form>{quizResult && <div className="quiz-result">You scored {quizResult.score} of {quizResult.total}.{quizResult.results.map((result, index) => <p key={index}>{result.correct ? "Correct" : "Review"} — {result.explanation}</p>)}</div>}</section>)}
        {course.modules.filter((module) => module.assignments?.length).map((module) => <section key={module._id} className="quiz-panel"><div className="eyebrow">PUT IT INTO PRACTICE</div><h3>{module.title} assignments</h3>{module.assignments.map((assignment) => {
          const submission = enrollment?.assignmentSubmissions?.find((item) => item.assignmentId === assignment._id);
          return <form className="assignment-form" key={assignment._id} onSubmit={(event) => submitAssignment(event, module, assignment)}><strong>{assignment.title}</strong><p>{assignment.instructions}</p><textarea value={assignmentDrafts[assignment._id] ?? submission?.answer ?? ""} onChange={(event) => setAssignmentDrafts((current) => ({ ...current, [assignment._id]: event.target.value }))} maxLength={12000} rows={5} placeholder="Write your response…" required disabled={!enrollment || user.role !== "student"} /><button className="primary-button" disabled={!enrollment || user.role !== "student"}>Submit assignment <ArrowRight size={15} /></button>{submission && <div className="quiz-result">{submission.score === undefined ? "Submitted and waiting for instructor feedback." : `Score: ${submission.score} · ${submission.feedback || "No written feedback yet."}`}</div>}</form>;
        })}</section>)}
      </div></div>
  </div>;
}

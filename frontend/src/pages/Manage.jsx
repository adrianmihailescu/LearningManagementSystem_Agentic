import { BookOpen, Plus, Save, Users } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import Notice from "../components/Notice.jsx";

const initialForm = {
  title: "", description: "", category: "Data Science", level: "Beginner", tags: "",
  moduleTitle: "Getting started", lessonTitle: "", lessonContent: "",
  quizPrompt: "", quizOptions: "", quizAnswer: "1", quizExplanation: "",
  assignmentTitle: "", assignmentInstructions: "",
};

export default function Manage() {
  const { user } = useAuth();
  const isAdmin = user.role === "admin";
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const requests = [api.get("/courses/mine")];
      if (isAdmin) requests.push(api.get("/users"));
      const [courseResult, userResult] = await Promise.all(requests);
      setCourses(courseResult.data.courses);
      if (userResult) setUsers(userResult.data.users);
    } catch (error) {
      setNotice(error.response?.data?.error || "Could not load management data.");
    }
  }
  useEffect(() => { load(); }, [isAdmin]);

  async function createCourse(event) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const options = form.quizOptions.split("\n").map((option) => option.trim()).filter(Boolean);
      const quiz = form.quizPrompt.trim() ? [{
        prompt: form.quizPrompt,
        options,
        answerIndex: Number(form.quizAnswer) - 1,
        explanation: form.quizExplanation,
      }] : [];
      const assignments = form.assignmentTitle.trim() ? [{
        title: form.assignmentTitle,
        instructions: form.assignmentInstructions,
      }] : [];
      await api.post("/courses", {
        title: form.title,
        description: form.description,
        category: form.category,
        level: form.level,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        modules: [{
          title: form.moduleTitle,
          lessons: [{ title: form.lessonTitle, content: form.lessonContent, type: "text", durationMinutes: 10 }],
          quiz,
          assignments,
        }],
      });
      setForm(initialForm);
      await load();
      setNotice("Your course is live in the catalog.");
    } catch (error) {
      setNotice(error.response?.data?.error || "Could not create the course.");
    } finally { setBusy(false); }
  }

  async function togglePublished(course) {
    try {
      await api.put(`/courses/${course._id}`, { published: !course.published });
      await load();
      setNotice("");
    } catch (error) {
      setNotice(error.response?.data?.error || "Could not update course visibility.");
    }
  }

  async function updateRole(target, role) {
    try {
      await api.patch(`/users/${target._id}/role`, { role });
      setUsers((current) => current.map((item) => item._id === target._id ? { ...item, role } : item));
      setNotice("");
    } catch (error) {
      setNotice(error.response?.data?.error || "Could not update this account.");
    }
  }

  async function reviewCourse(course) {
    try {
      const { data } = await api.get(`/courses/${course._id}/submissions`);
      setSelectedCourse(course);
      setSubmissions(data.submissions);
      setNotice("");
    } catch (error) {
      setNotice(error.response?.data?.error || "Could not load assignment submissions.");
    }
  }

  async function gradeSubmission(course, enrollment, submission, event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    try {
      await api.patch(`/courses/${course._id}/submissions/${enrollment.student._id}/${submission.assignmentId}`, {
        score: Number(formData.get("score")),
        feedback: formData.get("feedback"),
      });
      await reviewCourse(course);
    } catch (error) {
      setNotice(error.response?.data?.error || "Could not save assignment feedback.");
    }
  }

  return <div className="manage-page"><Notice message={notice} onClose={() => setNotice("")} />
    <div className="manage-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> {isAdmin ? "PLATFORM WORKSPACE" : "INSTRUCTOR WORKSPACE"}</div><h1>{isAdmin ? "Manage the learning space." : "Build something worth learning."}</h1><p className="page-subtitle">{isAdmin ? "Keep courses and people moving in the right direction." : "Create a course, add a first lesson, and share it with learners."}</p></div></div>
    {!isAdmin && <section className="manage-panel"><div className="manage-panel-title"><div className="stat-icon purple"><Plus size={18} /></div><div><h2>Create a course</h2><p>Start with a clear goal and one useful first lesson.</p></div></div>
      <form className="course-form" onSubmit={createCourse}>
        <label>Course title<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} minLength={3} maxLength={160} required /></label>
        <label>Category<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} maxLength={80} required /></label>
        <label>Level<select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
        <label>Tags <span>(comma separated)</span><input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Design, UX, Research" /></label>
        <label className="form-wide">Course description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} minLength={10} maxLength={3000} rows={3} required /></label>
        <div className="form-divider">YOUR FIRST MODULE & LESSON</div>
        <label>Module title<input value={form.moduleTitle} onChange={(e) => setForm({ ...form, moduleTitle: e.target.value })} required /></label>
        <label>Lesson title<input value={form.lessonTitle} onChange={(e) => setForm({ ...form, lessonTitle: e.target.value })} required /></label>
        <label className="form-wide">Lesson content<textarea value={form.lessonContent} onChange={(e) => setForm({ ...form, lessonContent: e.target.value })} rows={5} maxLength={12000} required /></label>
        <div className="form-divider">OPTIONAL KNOWLEDGE CHECK</div>
        <label className="form-wide">Question<input value={form.quizPrompt} onChange={(e) => setForm({ ...form, quizPrompt: e.target.value })} placeholder="What should learners understand?" /></label>
        <label>Answer choices <span>(one per line)</span><textarea value={form.quizOptions} onChange={(e) => setForm({ ...form, quizOptions: e.target.value })} rows={3} placeholder={"First option\nSecond option"} /></label>
        <label>Correct option number<input type="number" min="1" value={form.quizAnswer} onChange={(e) => setForm({ ...form, quizAnswer: e.target.value })} /><span>Count from 1, in the order above.</span></label>
        <label className="form-wide">Answer explanation<textarea value={form.quizExplanation} onChange={(e) => setForm({ ...form, quizExplanation: e.target.value })} rows={2} /></label>
        <div className="form-divider">OPTIONAL ASSIGNMENT</div>
        <label className="form-wide">Assignment title<input value={form.assignmentTitle} onChange={(e) => setForm({ ...form, assignmentTitle: e.target.value })} placeholder="A practical activity for learners" /></label>
        <label className="form-wide">Assignment instructions<textarea value={form.assignmentInstructions} onChange={(e) => setForm({ ...form, assignmentInstructions: e.target.value })} rows={3} /></label>
        <div className="form-wide"><button className="primary-button" disabled={busy}>{busy ? "Creating…" : "Create course"} <Save size={15} /></button></div>
      </form>
    </section>}
    <section className="manage-panel"><div className="manage-panel-title"><div className="stat-icon blue"><BookOpen size={18} /></div><div><h2>{isAdmin ? "All courses" : "Your courses"}</h2><p>{courses.length} {courses.length === 1 ? "course" : "courses"} in your workspace</p></div></div>
      {courses.length ? <div className="management-list">{courses.map((course) => <div className="management-row" key={course._id}><div className="management-course-icon"><BookOpen size={17} /></div><div className="management-info"><strong>{course.title}</strong><span>{course.category} · {course.level}</span></div><span className={`status-pill ${course.published ? "published" : "draft"}`}>{course.published ? "Published" : "Draft"}</span><button className="secondary-button" onClick={() => togglePublished(course)}>{course.published ? "Unpublish" : "Publish"}</button><button className="secondary-button" onClick={() => reviewCourse(course)}>Review work</button></div>)}</div> : <div className="manage-empty">No courses yet. Create your first course above.</div>}
    </section>
    {selectedCourse && <section className="manage-panel"><div className="manage-panel-title"><div className="stat-icon orange"><Users size={18} /></div><div><h2>Assignment work · {selectedCourse.title}</h2><p>Read student submissions and leave a score and feedback.</p></div></div>
      {submissions.length ? submissions.map((enrollment) => <div className="submission-student" key={enrollment._id}><strong>{enrollment.student.name} <span>{enrollment.student.email}</span></strong>{enrollment.assignmentSubmissions.map((submission) => <form className="submission-review" key={submission.assignmentId} onSubmit={(event) => gradeSubmission(selectedCourse, enrollment, submission, event)}><p>{submission.answer}</p><label>Score<input type="number" min="0" max="1000" name="score" defaultValue={submission.score ?? 0} required /></label><label>Feedback<input name="feedback" defaultValue={submission.feedback} maxLength={2000} /></label><button className="secondary-button">Save feedback</button></form>)}</div>) : <div className="manage-empty">No assignments have been submitted yet.</div>}
    </section>}
    {isAdmin && <section className="manage-panel"><div className="manage-panel-title"><div className="stat-icon orange"><Users size={18} /></div><div><h2>People and roles</h2><p>Give each person the access their work requires.</p></div></div>
      <div className="management-list">{users.map((person) => <div className="management-row" key={person._id}><div className="avatar">{person.name.slice(0, 1).toUpperCase()}</div><div className="management-info"><strong>{person.name}</strong><span>{person.email}</span></div><select className="role-select" value={person.role} onChange={(event) => updateRole(person, event.target.value)}><option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Administrator</option></select></div>)}</div>
    </section>}
  </div>;
}

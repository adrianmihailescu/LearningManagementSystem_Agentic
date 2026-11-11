import { Bot, Send, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import api, { getApiErrorMessage } from "../api";
import { useCurrentUser } from "../auth/AuthContext";
import Notice from "../components/Notice";
import type { AiIntent } from "../types/ai";
import type { ChatMessage } from "../interfaces/ai";
import type { Course } from "../interfaces/course";
import type { CourseListResponse } from "../interfaces/api";

export default function Tutor() {
  const user = useCurrentUser();
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState(() => searchParams.get("courseId") || "");
  const [intent, setIntent] = useState<AiIntent>(() => {
    const requestedIntent = searchParams.get("intent");
    const validIntents: AiIntent[] = ["tutor", "course", "outline", "quiz", "assessment", "evaluate", "performance", "path", "recommend"];
    return validIntents.find((item) => item === requestedIntent) || "tutor";
  });
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", content: "Hi! I’m your learning companion. Ask me to unpack a tricky idea, walk through an example, or help you think through a lesson." }]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    api.get<CourseListResponse>("/courses/mine")
      .then(({ data }) => setCourses(data.courses))
      .catch((error: unknown) => setNotice(getApiErrorMessage(error, "Could not load your courses.")));
  }, []);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    const history = messages.slice(1);
    setMessages((current) => [...current, { role: "user", content: text }]);
    setQuestion(""); setBusy(true); setNotice("");
    try {
      const { data } = await api.post<{ content: string }>("/ai/chat", { intent, message: text, history, ...(courseId ? { courseId } : {}) });
      setMessages((current) => [...current, { role: "assistant", content: data.content }]);
    } catch (error: unknown) {
      setNotice(getApiErrorMessage(error, "The tutor could not respond. Please try again."));
      setMessages((current) => current.slice(0, -1));
      setQuestion(text);
    } finally { setBusy(false); }
  }
  const intents: Array<[AiIntent, string]> = user.role === "student"
    ? [["tutor", "Explain a lesson"], ["path", "Recommend my next steps"], ["evaluate", "Review my progress"]]
    : [["tutor", "Explain a concept"], ["outline", "Create a course outline"], ["assessment", "Generate assessment ideas"]];
  return <div className="tutor-page"><Notice message={notice} onClose={() => setNotice("")} /><div className="tutor-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> A LITTLE HELP, RIGHT ON TIME</div><h1>Curiosity, <em>meet your tutor.</em></h1><p className="page-subtitle">Ask anything. We’ll work it out together, one idea at a time.</p></div><div className="tutor-orbit"><div><Bot size={27} /></div><Sparkles className="tutor-spark" size={18} /></div></div>
    <section className="chat-card"><header className="chat-header"><div className="chat-agent-icon"><Sparkles size={19} /></div><div><strong>Your AI learning companion</strong><span><i /> Here to help you understand</span></div><label className="context-select"><span>AI focus</span><select value={intent} onChange={(event) => { const selectedIntent = intents.find(([value]) => value === event.target.value); if (selectedIntent) setIntent(selectedIntent[0]); }}>{intents.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label><label className="context-select"><span>Lesson context</span><select value={courseId} onChange={(event) => setCourseId(event.target.value)}><option value="">General learning</option>{courses.map((course) => <option value={course._id} key={course._id}>{course.title}</option>)}</select></label></header>
      <div className="chat-messages">{messages.map((message, index) => <div key={index} className={`chat-message ${message.role}`}><div className="message-avatar">{message.role === "assistant" ? <Sparkles size={15} /> : "Y"}</div><div className="message-bubble">{message.content}</div></div>)}{busy && <div className="chat-message assistant"><div className="message-avatar"><Sparkles size={15} /></div><div className="message-bubble typing"><i /><i /><i /></div></div>}</div>
      <form className="chat-form" onSubmit={send}><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What are you curious about?" maxLength={4000} /><button className="send-button" disabled={!question.trim() || busy} aria-label="Send message"><Send size={17} /></button></form><p className="chat-footnote">AI can make mistakes. Use it as a guide, and keep asking questions.</p>
    </section></div>;
}

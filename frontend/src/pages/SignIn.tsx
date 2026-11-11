import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getApiErrorMessage } from "../api";
import type { SignInForm } from "../interfaces/auth";

export default function SignIn() {
  const { user, signIn, ready } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState<SignInForm>({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!ready) return <div className="loading-screen">Preparing your learning space…</div>;
  if (user) return <Navigate to="/" replace />;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try { await signIn(form, isRegister); }
    catch (failure: unknown) { setError(getApiErrorMessage(failure, "Could not sign in. Check that the API is running.")); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><section className="auth-art"><a className="brand auth-brand" href="/"><span className="brand-icon"><BookOpen size={19} /></span><span>smart<span className="brand-light">learning</span></span></a><div className="auth-art-copy"><div className="eyebrow"><span className="eyebrow-line" /> A BETTER WAY TO GROW</div><h1>Make learning<br />feel like <em>your thing.</em></h1><p>A place for curious minds, thoughtful lessons, and the next version of you.</p><div className="auth-art-book"><div><Sparkles size={36} /><span>keep<br />wondering</span></div><span className="auth-orbit o1" /><span className="auth-orbit o2" /></div><div className="auth-art-bottom">A little progress changes everything. <span>✦</span></div></div><div className="auth-form-side"><form className="auth-form" onSubmit={submit}><div className="eyebrow">{isRegister ? "YOUR NEXT CHAPTER" : "WELCOME BACK"}</div><h2>{isRegister ? "Create your account" : "Login"}</h2><p>{isRegister ? "Your learning journey starts right here." : "Your learning space is ready when you are."}</p>{error && <div className="notice" role="alert">{error}</div>}{isRegister && <label>Your name<input autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} /></label>}<label>Email address<input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label><label>Password<input type="password" autoComplete={isRegister ? "new-password" : "current-password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} /></label><button className="primary-button auth-submit" disabled={busy}>{busy ? "One moment…" : isRegister ? "Create account" : "Sign in"} <ArrowRight size={16} /></button><div className="auth-switch">{isRegister ? "Already learning with us?" : "New to SmartLearning?"}<button type="button" onClick={() => { setIsRegister(!isRegister); setError(""); }}>{isRegister ? "Sign in" : "Create an account"}</button></div><div className="demo-hint">Local demo accounts are listed in the project README.</div></form></div></section></main>;
}

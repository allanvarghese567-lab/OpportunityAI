import { useState } from "react";
import { authApi } from "../lib/api";

interface Props {
  onLogin: (user: any) => void;
}

export default function LoginPage({ onLogin }: Props) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await authApi.register({ email, password, full_name: fullName || undefined });
      }
      const { access_token } = await authApi.login(email, password);
      localStorage.setItem("token", access_token);
      const user = await authApi.me();
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            ARTHA<span className="text-blue-600"> AI</span>
          </h1>
          <p className="text-slate-500 mt-2">
            Discover Value. Engineer Opportunity. Build Wealth.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Economic Intelligence · Opportunity · Wealth Creation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-semibold text-lg">{isRegister ? "Create account" : "Sign in"}</h2>

          {isRegister && (
            <div>
              <label className="block text-sm font-medium mb-1">Full name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
          </button>

          <p className="text-center text-sm text-slate-500">
            {isRegister ? "Already have an account?" : "No account yet?"}{" "}
            <button type="button" onClick={() => { setIsRegister(!isRegister); setError(""); }}
              className="text-blue-600 font-medium hover:underline">
              {isRegister ? "Sign in" : "Register"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, LogOut, Menu, X, Building2 } from "lucide-react";

interface LayoutProps {
  user: { email: string; full_name?: string };
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, onLogout, children }: LayoutProps) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects/new", label: "New Project", icon: PlusCircle },
    { to: "/enterprise", label: "Enterprise", icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/" className="font-semibold text-lg tracking-tight" onClick={() => setMenuOpen(false)}>
              Opportunity<span className="text-blue-600">AI</span>
            </Link>
            <nav className="hidden sm:flex gap-1">
              {nav.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                    }`}>
                    <item.icon className="w-4 h-4" />{item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline truncate max-w-[160px]">{user.full_name || user.email}</span>
            <button onClick={onLogout} className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
              <LogOut className="w-4 h-4" /> Logout
            </button>
            <button className="sm:hidden p-1.5 text-slate-600 hover:bg-slate-100 rounded-md" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="sm:hidden border-t bg-white px-4 py-3 space-y-1">
            {nav.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium ${
                    active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                  }`}>
                  <item.icon className="w-4 h-4" />{item.label}
                </Link>
              );
            })}
            <div className="border-t pt-2 mt-2">
              <p className="px-3 text-xs text-slate-400 truncate">{user.full_name || user.email}</p>
              <button onClick={() => { setMenuOpen(false); onLogout(); }}
                className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-md w-full">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">{children}</main>
    </div>
  );
}

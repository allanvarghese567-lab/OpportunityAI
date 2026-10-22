import { useState, useEffect } from "react";
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

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 flex flex-col">
      <header className="border-b bg-white sticky top-0 z-30 safe-pt">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-8 min-w-0">
            <Link to="/" className="font-semibold text-lg tracking-tight shrink-0" onClick={() => setMenuOpen(false)}>
              ARTHA<span className="text-blue-600"> AI</span>
            </Link>
            <nav className="hidden sm:flex gap-1">
              {nav.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"
                    }`}>
                    <item.icon className="w-4 h-4" />{item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 hidden md:inline truncate max-w-[140px]">{user.full_name || user.email}</span>
            <button onClick={onLogout} className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 px-2 py-2 rounded-md">
              <LogOut className="w-4 h-4" /><span className="hidden lg:inline">Logout</span>
            </button>
            <button type="button" className="sm:hidden touch-target flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md"
              onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <>
            <div className="sm:hidden fixed inset-0 top-14 bg-black/30 z-20" onClick={() => setMenuOpen(false)} aria-hidden />
            <div className="sm:hidden absolute left-0 right-0 top-14 border-b bg-white px-3 py-3 space-y-1 z-30 shadow-lg safe-pb">
              {nav.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to} onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium touch-target ${
                      active ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
                    }`}>
                    <item.icon className="w-5 h-5" />{item.label}
                  </Link>
                );
              })}
              <div className="border-t pt-2 mt-2">
                <p className="px-3 text-xs text-slate-400 truncate mb-1">{user.full_name || user.email}</p>
                <button type="button" onClick={() => { setMenuOpen(false); onLogout(); }}
                  className="flex items-center gap-3 px-3 py-3 text-base text-slate-700 hover:bg-slate-100 rounded-lg w-full touch-target">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </div>
          </>
        )}
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-8 safe-pb">{children}</main>
    </div>
  );
}

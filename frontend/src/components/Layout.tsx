import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, LogOut } from "lucide-react";

interface LayoutProps {
  user: { email: string; full_name?: string };
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ user, onLogout, children }: LayoutProps) {
  const location = useLocation();

  const nav = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects/new", label: "New Project", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-semibold text-lg tracking-tight">
              Opportunity<span className="text-blue-600">AI</span>
            </Link>
            <nav className="hidden sm:flex gap-1">
              {nav.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 hidden sm:inline">
              {user.full_name || user.email}
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

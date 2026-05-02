"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  School,
  BarChart2,
  Info,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Schools", href: "/schools", icon: School },
  { label: "Insights", href: "/insights", icon: BarChart2 },
  { label: "About", href: "/about", icon: Info },
];

function SigappLogo() {
  return (
    <div className="flex items-center justify-center px-6 py-16">
      <img src="/logo-light-mode-with-texts.png" alt="SIGAPP Logo" className="h-48 w-auto object-contain" />
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 z-40 flex flex-col sidebar-scroll overflow-y-auto"
      style={{
        width: 450,
        backgroundColor: "#FFFFFF",
        borderRight: "1px solid #F1F5F9",
      }}
    >
      {/* Logo */}
      <SigappLogo />

      {/* Divider */}
      <div
        className="mx-4 mb-2"
        style={{ height: 1, backgroundColor: "#F1F5F9" }}
      />

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-2">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium
                transition-all duration-150 relative
                ${
                  active
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }
              `}
              style={
                active
                  ? { backgroundColor: "rgba(0,180,180,0.1)" }
                  : undefined
              }
            >
              {/* Active indicator – teal left border */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r"
                  style={{
                    width: 3,
                    height: 20,
                    backgroundColor: "#00B4B4",
                  }}
                />
              )}
              <Icon
                size={18}
                className={`flex-shrink-0 ${
                  active
                    ? "text-[#00B4B4]"
                    : "text-slate-500 group-hover:text-slate-800"
                }`}
              />
              <span className={active ? "text-[#00B4B4]" : "text-slate-600 group-hover:text-slate-900"}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4 text-xs"
        style={{ color: "#94A3B8" }}
      >
        MVP v0.1 · Jakarta
      </div>
    </aside>
  );
}

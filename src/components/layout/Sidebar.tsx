"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  School,
  BarChart2,
  Info,
  Map,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Interactive Map", href: "/map", icon: Map },
  { label: "Schools", href: "/schools", icon: School },
  { label: "Insights", href: "/insights", icon: BarChart2 },
  { label: "About", href: "/about", icon: Info },
];

function SigappLogo() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-6">
      {/* Inline SVG diamond/layers icon */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M14 2L26 14L14 26L2 14L14 2Z"
          fill="#00B4B4"
          fillOpacity="0.15"
          stroke="#00B4B4"
          strokeWidth="1.5"
        />
        <path
          d="M14 7L22 14L14 21L6 14L14 7Z"
          fill="#00B4B4"
          fillOpacity="0.35"
          stroke="#00B4B4"
          strokeWidth="1.2"
        />
        <path
          d="M14 11L18 14L14 17L10 14L14 11Z"
          fill="#00B4B4"
          fillOpacity="0.7"
        />
      </svg>
      <span
        className="text-xl font-bold tracking-wide"
        style={{ color: "#00B4B4" }}
      >
        SIGAPP
      </span>
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
        width: 240,
        backgroundColor: "#0D2137",
      }}
    >
      {/* Logo */}
      <SigappLogo />

      {/* Divider */}
      <div
        className="mx-4 mb-2"
        style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)" }}
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
                    : "text-slate-500 group-hover:text-slate-300"
                }`}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4 text-xs"
        style={{ color: "rgba(255,255,255,0.3)" }}
      >
        MVP v0.1 · Jakarta
      </div>
    </aside>
  );
}

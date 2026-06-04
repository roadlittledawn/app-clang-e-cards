"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface Props {
  userEmail?: string;
  isAdmin?: boolean;
}

const NAV_LINKS = [
  { href: "/dashboard", label: "My Cards" },
  { href: "/library", label: "Images" },
];

export default function Nav({ userEmail, isAdmin }: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200" aria-label="Main navigation">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand */}
          <Link href="/dashboard" className="font-semibold text-indigo-600 text-lg tracking-tight">
            E-Cards
          </Link>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith(href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/invites"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith("/admin")
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Invites
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="hidden sm:flex items-center gap-3">
            {userEmail && (
              <span className="text-xs text-gray-400 max-w-[140px] truncate">{userEmail}</span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-500 hover:text-gray-900 transition"
            >
              Sign out
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden border-t border-gray-100 py-3 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith(href) ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin/invites"
                onClick={() => setMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.startsWith("/admin") ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                Invites
              </Link>
            )}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between px-3">
              {userEmail && <span className="text-xs text-gray-400 truncate">{userEmail}</span>}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

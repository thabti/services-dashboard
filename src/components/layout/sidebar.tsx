"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Baby,
  Car,
  Home,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
];

const serviceItems: NavItem[] = [
  { label: "Nannies", href: "/services/nannies", icon: Baby },
  { label: "Gear Refresh", href: "/services/gear-refresh", icon: Car },
  { label: "Home Care", href: "/services/home-care", icon: Home },
];

export function TopNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="bg-white border-b border-neutral-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center">
          {/* Navigation Links */}
          <div className="flex items-center gap-8 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive(item.href)
                    ? "bg-brand-primary text-white hover:bg-brand-primary/90"
                    : "text-text-secondary hover:text-text-primary hover:bg-neutral-50"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
            {serviceItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive(item.href)
                    ? "bg-brand-primary text-white hover:bg-brand-primary/90"
                    : "text-text-secondary hover:text-text-primary hover:bg-neutral-50"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-64 h-screen bg-white border-r border-neutral-100 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">Services</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-brand-primary text-white"
                    : "text-text-secondary hover:bg-neutral-50"
                )}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Services Section */}
        <div className="mt-6 pt-6 border-t border-neutral-100">
          <p className="px-3 text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
            Services
          </p>
          <ul className="space-y-1">
            {serviceItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-brand-primary text-white"
                      : "text-text-secondary hover:bg-neutral-50"
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  MessageSquare,
  Package,
  Users,
  FileText,
  FileCheck,
  Receipt,
  Settings,
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Baby,
  Car,
  Home,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Performance", href: "/performance", icon: TrendingUp },
  { label: "Messages", href: "/messages", icon: MessageSquare, badge: 20 },
  { label: "My Product", href: "/products", icon: Package },
  { label: "Contacts", href: "/contacts", icon: Users },
  {
    label: "Documents",
    href: "/documents",
    icon: FileText,
    children: [
      { label: "Invoices", href: "/documents/invoices" },
      { label: "Handbills", href: "/documents/handbills" },
    ],
  },
];

const serviceItems: NavItem[] = [
  { label: "Nannies", href: "/services/nannies", icon: Baby },
  { label: "Car Seats", href: "/services/car-seats", icon: Car },
  { label: "Home Care", href: "/services/home-care", icon: Home },
];

const bottomItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help Center", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(["Documents"]);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isChildActive = (item: NavItem) =>
    item.children?.some((child) => pathname === child.href);

  return (
    <aside className="w-64 h-screen bg-white border-r border-neutral-100 flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">Paysave</span>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search here..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-lg placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <div>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isChildActive(item)
                        ? "bg-brand-primary text-white"
                        : "text-text-secondary hover:bg-neutral-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="size-5" />
                      {item.label}
                    </div>
                    {expandedItems.includes(item.label) ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )}
                  </button>
                  {expandedItems.includes(item.label) && (
                    <ul className="mt-1 ml-8 space-y-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              "block px-3 py-2 rounded-lg text-sm transition-colors",
                              isActive(child.href)
                                ? "text-brand-primary font-medium"
                                : "text-text-muted hover:text-text-secondary"
                            )}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
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
                  {item.badge && (
                    <span className="ml-auto px-2 py-0.5 bg-success-50 text-success-600 text-xs font-medium rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
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

      {/* Bottom Section */}
      <div className="border-t border-neutral-100 p-3">
        <ul className="space-y-1">
          {bottomItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-neutral-50 transition-colors"
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Sales Goal */}
        <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">Monthly Sales Goal:</span>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-sm font-bold text-text-primary">$12,894.92</span>
            <span className="text-xs text-text-muted">/ $14,894.92</span>
          </div>
          <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary rounded-full transition-all duration-500"
              style={{ width: "86%" }}
            />
          </div>
          <button className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-primary hover:underline">
            See Details
            <ChevronDown className="size-3 rotate-[-90deg]" />
          </button>
        </div>

        {/* User */}
        <div className="mt-4 flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer">
          <div className="size-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
            <span className="text-white font-medium text-sm">NJ</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">Nathan Jacob</p>
            <p className="text-xs text-text-muted truncate">n.jacob@email.com</p>
          </div>
          <ChevronDown className="size-4 text-text-muted" />
        </div>
      </div>
    </aside>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const categories = [
  { name: "ყველა პროდუქტი", href: "/products" },
  { name: "კაბები", href: "/products?category=dresses" },
  { name: "ზედა ტანსაცმელი", href: "/products?category=tops" },
  { name: "შარვლები & ქვედაბოლოები", href: "/products?category=bottoms" },
  { name: "აქსესუარები", href: "/products?category=accessories" },
];

export function CategoryDropdown({ 
  baseClassName,
  onNavigate 
}: { 
  baseClassName?: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(false);
    onNavigate?.();
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
            className={cn(
              baseClassName ?? "inline-flex items-center justify-center rounded-full px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.22em] transition-all duration-200 text-white/74 hover:bg-white/8 hover:text-white",
              "gap-1 outline-none"
            )}
          >
            პროდუქცია
            <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", open && "rotate-180")} />
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-56 mt-1 bg-black/90 backdrop-blur-md border-white/10 text-white p-2 rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          {categories.map((category) => (
            <Link key={category.href} href={category.href} onClick={handleClick}>
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors focus:bg-white/10">
                <span className="text-sm">{category.name}</span>
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

"use client";

import Link from "next/link";
import { User, LogOut, Package, UserCircle, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function ProfileDropdown() {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <Link href="/auth/login">
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 font-semibold tracking-wider uppercase text-[0.7rem]">
          შესვლა
        </Button>
      </Link>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
          className="text-white hover:bg-white/10 flex items-center gap-2 px-3 group transition-all duration-300 rounded-full h-9"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="hidden sm:inline font-semibold tracking-wider uppercase text-[0.7rem]">
            {user.firstName}
          </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2 bg-black/90 backdrop-blur-md border-white/10 text-white p-2 rounded-xl shadow-2xl animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2">
        <DropdownMenuLabel className="px-2 py-1.5 font-bold text-xs uppercase tracking-[0.15em] text-white/50">
          ჩემი პროფილი
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-white/10" />
        
        <Link href="/profile">
          <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors focus:bg-white/10">
            <UserCircle className="h-4 w-4" />
            <span className="text-sm">პროფილი</span>
          </DropdownMenuItem>
        </Link>
        
        <Link href="/orders">
          <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors focus:bg-white/10">
            <Package className="h-4 w-4" />
            <span className="text-sm">შეკვეთები</span>
          </DropdownMenuItem>
        </Link>

        {isAdmin && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <Link href="/admin">
              <DropdownMenuItem className="cursor-pointer flex items-center gap-2 p-2 hover:bg-white/10 rounded-lg transition-colors focus:bg-white/10 text-amber-400 focus:text-amber-400">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-semibold">ადმინ პანელი</span>
              </DropdownMenuItem>
            </Link>
          </>
        )}

        <DropdownMenuSeparator className="bg-white/10" />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer flex items-center gap-2 p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors focus:bg-red-500/20 focus:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">გასვლა</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

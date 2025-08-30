import Link from "next/link";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface MenuButtonProps {
  href: string;
  icon: ReactNode;
  children: ReactNode;
  active?: boolean;
  className?: string;
  onClick?: () => void; // Add the onClick property

}

export function MenuButton({ href, icon, children, active, className }: MenuButtonProps) {
  return (



    <Link
      href={href}
      className={cn(
        "w-[150px]",
        "flex items-center gap-2 mx-10 px-5 py-1 rounded-sm transition font-medium select-none",
        active ? "dark:bg-[#23232a] bg-main-100 text-main-900 dark:text-main-50" : " text-main-900 dark:text-main-50",
        className
      )}
    >
              {icon && <span className="h-5 w-5 flex">{icon}</span>}

      {children}
    </Link>
  );
}
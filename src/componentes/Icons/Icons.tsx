import { iconClassName, type IconProps } from "./Icons.ts";
import "./Icons.css";

function Contact({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
      <circle cx="12" cy="8.5" r="2.5" />
      <path d="M16.5 16.5a4.5 4.5 0 0 0-9 0" />
    </svg>
  );
}

function Lock({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function Eye({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
      <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
      <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-4.84" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function Search({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function Filter({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </svg>
  );
}

function Edit({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
    </svg>
  );
}

function More({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function Plus({ className, size = "md" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function Send({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={iconClassName(size, className)}
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={{ transform: "translateX(1px)" }}
    >
      <path d="m22 2-7 20-4-9-9-4z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function ChevronLeft({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRight({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChevronDown({ className, size = "xs" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Message({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
    </svg>
  );
}

function Download({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="m7 10 5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

function Play({ className, size = "md" }: IconProps) {
  return (
    <svg
      className={iconClassName(size, `icon--fill ${className ?? ""}`.trim())}
      viewBox="0 0 24 24"
      width={28}
      height={28}
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function X({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function Palette({ className, size = "sm" }: IconProps) {
  return (
    <svg
      className={iconClassName(size, `icon--palette ${className ?? ""}`.trim())}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="palette-dot" cx="13.5" cy="6.5" r="1.2" fill="currentColor" />
      <circle className="palette-dot" cx="17.5" cy="10.5" r="1.2" fill="currentColor" />
      <circle className="palette-dot" cx="8.5" cy="7.5" r="1.2" fill="currentColor" />
      <circle className="palette-dot" cx="6.5" cy="12.5" r="1.2" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.7-.7 1.7-1.6 0-.4-.2-.8-.4-1.1-.3-.4-.4-.8-.4-1.3 0-1.1.9-2 2-2H16c3.3 0 6-2.7 6-6 0-5-4.5-9-10-9z" />
    </svg>
  );
}

function Checks({ className }: IconProps) {
  return (
    <svg
      className={["icon", "icon--checks", className].filter(Boolean).join(" ")}
      viewBox="0 0 16 11"
      width={14}
      height={14}
      aria-hidden="true"
    >
      <path d="M1.5 6.2 4.2 9l5.3-7" />
      <path d="M7.5 6.2 10.2 9l5.3-7" />
    </svg>
  );
}

function Menu({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  );
}

function Reply({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="9 17 4 12 9 7" />
      <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
    </svg>
  );
}

function Forward({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="15 17 20 12 15 7" />
      <path d="M4 18v-2a4 4 0 0 1 4-4h12" />
    </svg>
  );
}

function Whatsapp({ className, size = "sm" }: IconProps) {
  return (
    <svg
      className={iconClassName(size, `icon--fill ${className ?? ""}`.trim())}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.7 8.23-8.23 8.23zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.35-.76-1.84-.2-.49-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.07-.1-.25-.16-.5-.29z" />
    </svg>
  );
}

function Trash({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function Tag({ className, size = "xs" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function Building({ className, size = "xs" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

function Zap({ className, size = "xs" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  );
}

function History({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function Messages({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
      <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
    </svg>
  );
}

function TicketOff({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h8" />
      <path d="M22 9a3 3 0 0 0 0 6v2a2 2 0 0 1-2 2H10" />
      <path d="M2 9V7a2 2 0 0 1 2-2h8" />
      <path d="M22 9V7a2 2 0 0 0-2-2h-4" />
      <path d="m2 2 20 20" />
    </svg>
  );
}

function Users({ className, size = "sm" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Team({ className, size = "xs" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LogOut({ className, size = "xs" }: IconProps) {
  return (
    <svg className={iconClassName(size, className)} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

export const Icons = {
  Contact,
  Lock,
  Eye,
  EyeOff,
  Search,
  Filter,
  Edit,
  More,
  Plus,
  Send,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Message,
  Download,
  Play,
  X,
  Palette,
  Checks,
  Menu,
  Reply,
  Forward,
  Whatsapp,
  Trash,
  Tag,
  Building,
  Zap,
  History,
  Messages,
  TicketOff,
  Users,
  Team,
  LogOut,
};

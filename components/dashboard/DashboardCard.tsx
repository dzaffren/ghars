import Link from "next/link";

interface Props {
  href?: string;
  children: React.ReactNode;
  className?: string;
}

// Soft minimalism base card — 1px sage border, light shadow, 16px radius.
// Wraps in a <Link> when href is provided so the whole card is tappable.
export default function DashboardCard({
  href,
  children,
  className = "",
}: Props) {
  const base =
    "block rounded-2xl border border-[var(--green-fog)] bg-white/78 p-4 " +
    "shadow-[0_2px_12px_-4px_rgba(45,106,79,0.08)] transition-shadow " +
    "hover:shadow-[0_4px_18px_-4px_rgba(45,106,79,0.14)] hover:-translate-y-px " +
    "active:scale-[0.99] " +
    className;

  if (href)
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  return <div className={base}>{children}</div>;
}

"use client";
type Props = { className?: string };
export function Skeleton({ className = "" }: Props) {
  return (
    <div className={`animate-pulse rounded-lg bg-[#1a3a2a]/8 ${className}`} />
  );
}

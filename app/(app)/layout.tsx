import { RadialNav } from "@/components/RadialNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <RadialNav />
    </>
  );
}

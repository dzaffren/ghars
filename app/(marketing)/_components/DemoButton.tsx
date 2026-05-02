"use client";

export function DemoButton() {
  async function handleDemo() {
    const res = await fetch("/api/demo/start", { method: "POST" });
    const data = await res.json();
    if (data.redirect) window.location.href = data.redirect;
  }

  return (
    <button
      onClick={handleDemo}
      className="w-full text-center py-3 px-6 rounded-xl text-sm"
      style={{ color: "var(--text-muted)" }}
      data-testid="demo-btn"
    >
      Try with sample data
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";

const DESKTOP = "/videos/garden-loop.mp4";
const MOBILE = "/videos/garden-loop-mobile.mp4";

export default function LandingVideo() {
  const [src, setSrc] = useState(MOBILE);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px)");
    const update = () => setSrc(mq.matches ? DESKTOP : MOBILE);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <video
      key={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      poster="/images/garden-loop-poster.jpg"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      style={{ background: "#faf7f0", opacity: 0.75 }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

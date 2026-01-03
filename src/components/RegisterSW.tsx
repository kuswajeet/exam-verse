"use client";
import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => console.log("SW Registered:", registration))
        .catch((err) => console.log("SW Failed:", err));
    }
  }, []);
  return null;
}
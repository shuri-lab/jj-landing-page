import { useEffect, useState } from "react";

const INITIAL_COUNTDOWN_MS = 23 * 60 * 60 * 1000;

export function useCountdown(target: Date) {
  const [now, setNow] = useState(() => target.getTime() - INITIAL_COUNTDOWN_MS);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  const diff = Math.max(0, target.getTime() - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export function pad(n: number) {
  return n.toString().padStart(2, "0");
}
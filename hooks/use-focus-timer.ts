"use client";

import { useEffect, useState } from "react";

export function useFocusTimer(initialMinutes = 25) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          setActive(false);
          return 0;
        }

        return currentSeconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  const minutesStr = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secondsStr = (seconds % 60).toString().padStart(2, "0");

  const formattedTime = `${minutesStr}:${secondsStr}`;

  const toggleTimer = () => setActive((prev) => !prev);

  return {
    seconds,
    active,
    formattedTime,
    minutesStr,
    secondsStr,
    toggleTimer,
    setActive,
  };
}

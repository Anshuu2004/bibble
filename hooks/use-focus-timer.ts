"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useFocusTimer(initialMinutes = 25, onComplete?: () => void) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [active, setActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const [prevInitialMinutes, setPrevInitialMinutes] = useState(initialMinutes);
  if (prevInitialMinutes !== initialMinutes) {
    setPrevInitialMinutes(initialMinutes);
    if (!active && !isCompleted) {
      setSeconds(initialMinutes * 60);
    }
  }

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => {
      setSeconds((currentSeconds) => {
        if (currentSeconds <= 1) {
          setActive(false);
          setIsCompleted(true);
          onCompleteRef.current?.();
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

  const toggleTimer = useCallback(() => {
    if (isCompleted && seconds === 0) {
      // If completed and restarted, reset back to full duration
      setSeconds(initialMinutes * 60);
      setIsCompleted(false);
      setActive(true);
      return;
    }
    setActive((prev) => !prev);
  }, [initialMinutes, isCompleted, seconds]);

  const resetTimer = useCallback(() => {
    setActive(false);
    setIsCompleted(false);
    setSeconds(initialMinutes * 60);
  }, [initialMinutes]);

  return {
    seconds,
    active,
    formattedTime,
    minutesStr,
    secondsStr,
    toggleTimer,
    setActive,
    resetTimer,
    isCompleted,
    setIsCompleted,
  };
}

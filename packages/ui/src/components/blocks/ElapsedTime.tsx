"use client";

import { useEffect, useRef, useState } from "react";

interface ElapsedTimeProps {
  content: string;
}

export function ElapsedTime({ content }: ElapsedTimeProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const processingTimer = useRef<NodeJS.Timeout>();

  useEffect(() => {
    processingTimer.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (processingTimer.current) {
        clearInterval(processingTimer.current);
        processingTimer.current = undefined;
      }
    };
  }, []);

  return `${content} (${elapsedTime}s)`;
}

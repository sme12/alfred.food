"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import type { RefObject } from "react";

const LONG_PRESS_DELAY = 300;
const FILL_DURATION = 1000;
const MOVE_THRESHOLD = 10;

function triggerHaptic(pattern: number | number[] = 15) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

interface UseLongPressOptions {
  onTap: () => void;
  onLongPressComplete: () => void;
}

interface LongPressHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchCancel: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerCancel: (e: React.PointerEvent) => void;
  onPointerLeave: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

interface UseLongPressReturn {
  filling: boolean;
  handlers: LongPressHandlers;
  progressRef: RefObject<HTMLDivElement | null>;
}

export function useLongPress({
  onTap,
  onLongPressComplete,
}: UseLongPressOptions): UseLongPressReturn {
  const [filling, setFilling] = useState(false);
  const fillingRef = useRef(false);
  const delayRafRef = useRef(0);
  const pressStartRef = useRef(0);
  const didLongPress = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const pressedBy = useRef<"touch" | "pointer" | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // Keep callbacks fresh without re-creating handlers
  const onLongPressCompleteRef = useRef(onLongPressComplete);
  const onTapRef = useRef(onTap);
  useEffect(() => {
    onLongPressCompleteRef.current = onLongPressComplete;
    onTapRef.current = onTap;
  });

  // rAF loop for fill progress animation
  useEffect(() => {
    const el = progressRef.current;
    if (!el) return;

    if (!filling) {
      el.style.transform = "scaleX(0)";
      el.style.opacity = "0";
      return;
    }

    el.style.opacity = "1";
    const start = performance.now();
    let rafId = 0;

    function tick(now: number) {
      const progress = Math.min((now - start) / FILL_DURATION, 1);
      el!.style.transform = `scaleX(${progress})`;

      if (progress >= 1) {
        triggerHaptic([20, 30, 20]);
        onLongPressCompleteRef.current();
        return;
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [filling]);

  // Cleanup delay rAF on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(delayRafRef.current);
  }, []);

  const cancelPress = useCallback(() => {
    cancelAnimationFrame(delayRafRef.current);
    fillingRef.current = false;
    setFilling(false);
    pressedBy.current = null;
  }, []);

  // rAF-based delay instead of setTimeout (avoids iOS timer throttling)
  const startPress = useCallback(
    (x: number, y: number, source: "touch" | "pointer") => {
      if (pressedBy.current) return;
      pressedBy.current = source;
      didLongPress.current = false;
      startPos.current = { x, y };
      pressStartRef.current = performance.now();

      function checkDelay(now: number) {
        if (now - pressStartRef.current >= LONG_PRESS_DELAY) {
          didLongPress.current = true;
          triggerHaptic(15);
          fillingRef.current = true;
          setFilling(true);
          return;
        }
        delayRafRef.current = requestAnimationFrame(checkDelay);
      }

      delayRafRef.current = requestAnimationFrame(checkDelay);
    },
    []
  );

  const endPress = useCallback(
    (source: "touch" | "pointer") => {
      if (pressedBy.current !== source) return;
      if (fillingRef.current) {
        cancelPress();
        return;
      }
      cancelAnimationFrame(delayRafRef.current);
      const wasLongPress = didLongPress.current;
      didLongPress.current = false;
      pressedBy.current = null;
      if (!wasLongPress) {
        onTapRef.current();
      }
    },
    [cancelPress]
  );

  const movePress = useCallback(
    (x: number, y: number) => {
      if (!pressedBy.current) return;
      const dx = x - startPos.current.x;
      const dy = y - startPos.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > MOVE_THRESHOLD) {
        cancelPress();
      }
    },
    [cancelPress]
  );

  // Touch handlers (mobile)
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const t = e.touches[0];
      startPress(t.clientX, t.clientY, "touch");
    },
    [startPress]
  );

  const onTouchEnd = useCallback(() => {
    endPress("touch");
  }, [endPress]);

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const t = e.touches[0];
      movePress(t.clientX, t.clientY);
    },
    [movePress]
  );

  const onTouchCancel = useCallback(() => {
    if (pressedBy.current !== "touch") return;
    cancelPress();
  }, [cancelPress]);

  // Pointer handlers (desktop mouse fallback)
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "touch") return;
      startPress(e.clientX, e.clientY, "pointer");
    },
    [startPress]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "touch") return;
      endPress("pointer");
    },
    [endPress]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "touch") return;
      movePress(e.clientX, e.clientY);
    },
    [movePress]
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerType === "touch") return;
      cancelPress();
    },
    [cancelPress]
  );

  const onPointerLeave = useCallback(() => {
    if (pressedBy.current === "pointer") cancelPress();
  }, [cancelPress]);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return {
    filling,
    progressRef,
    handlers: {
      onTouchStart,
      onTouchEnd,
      onTouchMove,
      onTouchCancel,
      onPointerDown,
      onPointerUp,
      onPointerMove,
      onPointerCancel,
      onPointerLeave,
      onContextMenu,
    },
  };
}

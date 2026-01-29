"use client";

import { motion } from "motion/react";
import type { ShoppingItemWithId } from "@/schemas/mealPlanResponse";
import { useLongPress } from "@/hooks/useLongPress";

interface LongPressShoppingItemProps {
  item: ShoppingItemWithId;
  isChecked: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function LongPressShoppingItem({
  item,
  isChecked,
  onToggle,
  onDelete,
}: LongPressShoppingItemProps) {
  const { filling, handlers, progressRef } = useLongPress({
    onTap: () => onToggle(item.id),
    onLongPressComplete: () => onDelete(item.id),
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-lg"
    >
      <motion.div
        role="checkbox"
        tabIndex={0}
        aria-checked={isChecked}
        animate={filling ? { x: [-1.5, 1.5, -1, 1, 0] } : { x: 0 }}
        transition={
          filling
            ? { duration: 0.4, ease: "easeInOut", repeat: Infinity }
            : { duration: 0 }
        }
        {...handlers}
        style={{
          touchAction: "pan-y",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
        }}
        className={`relative w-full flex items-center gap-3 h-12 px-3 rounded-lg transition-colors select-none cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          isChecked ? "bg-card/50 text-muted" : "bg-card hover:bg-card-hover"
        }`}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="absolute inset-0 rounded-lg pointer-events-none will-change-transform"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.45)",
            transformOrigin: "left",
            transform: "scaleX(0)",
            opacity: 0,
          }}
        />

        {/* Checkbox indicator */}
        <div
          aria-hidden="true"
          className={`relative z-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isChecked ? "bg-success border-success text-white" : "border-border"
          }`}
        >
          {isChecked && <span className="text-xs">✓</span>}
        </div>

        {/* Item content */}
        <span
          className={`relative z-1 flex-1 text-left text-sm min-w-0 truncate ${isChecked ? "line-through" : ""}`}
        >
          {item.name}
        </span>
        <span className="relative z-1 text-xs text-muted shrink-0">
          {item.amount}
        </span>
      </motion.div>
    </motion.div>
  );
}

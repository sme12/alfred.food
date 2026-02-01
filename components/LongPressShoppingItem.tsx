"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslations } from "next-intl";
import type { ShoppingItemWithId } from "@/schemas/mealPlanResponse";
import { useLongPress } from "@/hooks/useLongPress";

interface LongPressShoppingItemProps {
  item: ShoppingItemWithId;
  isChecked: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export function LongPressShoppingItem({
  item,
  isChecked,
  onToggle,
  onDelete,
}: LongPressShoppingItemProps) {
  const t = useTranslations("shoppingList");
  const [expanded, setExpanded] = useState(false);

  const { pressing, handlers } = useLongPress({
    onTap: () => onToggle(item.id),
    onLongPress: () => setExpanded((prev) => !prev),
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-lg"
    >
      {/* Main item row */}
      <motion.div
        role="checkbox"
        tabIndex={0}
        aria-checked={isChecked}
        aria-expanded={expanded}
        animate={{
          scale: pressing ? 1.03 : expanded ? 1.02 : 1,
          boxShadow:
            pressing || expanded
              ? "0 8px 24px -4px rgba(0, 0, 0, 0.3)"
              : "0 0 0 0 rgba(0, 0, 0, 0)",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        {...handlers}
        style={{
          touchAction: "pan-y",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
        }}
        className={`relative z-10 w-full flex items-center gap-3 h-12 px-3 rounded-lg transition-colors select-none cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          isChecked ? "bg-card/50 text-muted" : "bg-card hover:bg-card-hover"
        }`}
      >
        {/* Checkbox indicator */}
        <div
          aria-hidden="true"
          className={`relative w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isChecked ? "bg-success border-success text-white" : "border-border"
          }`}
        >
          {isChecked && <span className="text-xs">✓</span>}
        </div>

        {/* Item content */}
        <span
          className={`flex-1 text-left text-sm min-w-0 truncate ${isChecked ? "line-through" : ""}`}
        >
          {item.name}
        </span>
        <span className="text-xs text-muted shrink-0">{item.amount}</span>
      </motion.div>

      {/* Collapsible tray */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { type: "spring", stiffness: 500, damping: 35 },
              opacity: { duration: 0.15 },
            }}
            className="overflow-hidden"
          >
            <div
              className="mx-1 mb-1 px-4 py-4 rounded-b-lg bg-background"
              style={{
                boxShadow: "inset 0 4px 8px -4px rgba(0, 0, 0, 0.4)",
              }}
            >
              {/* forMeal text */}
              {item.forMeal && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-sm text-muted mb-4 flex items-start gap-2"
                >
                  <span className="shrink-0 opacity-60">📍</span>
                  <span>{item.forMeal}</span>
                </motion.p>
              )}

              {/* Delete button */}
              <motion.button
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={() => onDelete(item.id)}
                className="w-full h-11 flex items-center justify-center gap-2 text-sm text-muted rounded-lg bg-card/50 transition-colors hover:text-error hover:bg-error/10 active:bg-error/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error"
              >
                <TrashIcon className="w-4 h-4" />
                <span>{t("delete")}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

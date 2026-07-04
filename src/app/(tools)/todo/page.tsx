"use client";

import { useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  Reorder,
  motion,
  useDragControls,
} from "framer-motion";
import { Plus, GripVertical, X, ListChecks, Undo2 } from "lucide-react";
import { useToolState } from "@/lib/storage";
import { feedback } from "@/lib/sound";
import { spring } from "@/lib/motion";

interface Todo {
  id: string;
  text: string;
  done: boolean;
}

function sink(list: Todo[]): Todo[] {
  const active = list.filter((t) => !t.done);
  const done = list.filter((t) => t.done);
  return [...active, ...done];
}

export default function TodoPage() {
  const { value: todos, setValue: setTodos } = useToolState<Todo[]>("todo", []);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [trash, setTrash] = useState<{ todo: Todo; index: number } | null>(null);
  const trashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const remaining = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    feedback("pop");
    const next: Todo = { id: crypto.randomUUID(), text: t, done: false };
    setTodos((prev) => sink([next, ...prev]));
    setText("");
    inputRef.current?.focus();
  };

  const toggle = (id: string) => {
    feedback("success");
    setTodos((prev) => sink(prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))));
  };

  const remove = (id: string) => {
    feedback("tick");
    const index = todos.findIndex((t) => t.id === id);
    const todo = todos[index];
    if (!todo) return;
    setTodos((prev) => prev.filter((t) => t.id !== id));
    setTrash({ todo, index });
    if (trashTimer.current) clearTimeout(trashTimer.current);
    trashTimer.current = setTimeout(() => setTrash(null), 4500);
  };

  const undo = () => {
    if (!trash) return;
    feedback("pop");
    setTodos((prev) => {
      const copy = [...prev];
      copy.splice(Math.min(trash.index, copy.length), 0, trash.todo);
      return sink(copy);
    });
    setTrash(null);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-xl flex-col py-10">
      <div className="mb-6 flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">To-do</h1>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={remaining}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="text-sm text-muted tabular"
          >
            {remaining === 0 ? "all done" : `${remaining} left`}
          </motion.span>
        </AnimatePresence>
      </div>

      <form onSubmit={add} className="mb-4 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 focus-within:border-border-strong">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a task"
            className="w-full bg-transparent py-3 text-base outline-none placeholder:text-subtle"
          />
        </div>
        <motion.button
          type="submit"
          whileTap={{ scale: 0.92 }}
          transition={spring.snappy}
          aria-label="Add task"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-fg cursor-pointer"
        >
          <Plus size={20} />
        </motion.button>
      </form>

      {todos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 flex flex-col items-center gap-3 text-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <ListChecks size={26} />
          </div>
          <p className="text-[15px] font-medium">Nothing on your plate</p>
          <p className="text-sm text-muted">Add your first task above to get going.</p>
        </motion.div>
      ) : (
        <Reorder.Group axis="y" values={todos} onReorder={setTodos} className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {todos.map((todo) => (
              <TodoRow key={todo.id} todo={todo} onToggle={toggle} onDelete={remove} />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      <AnimatePresence>
        {trash && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={spring.soft}
            style={{ bottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
            className="fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-surface px-4 py-2.5 shadow-lg"
          >
            <span className="text-sm text-muted">Task deleted</span>
            <button
              onClick={undo}
              className="flex items-center gap-1.5 text-sm font-medium text-accent cursor-pointer"
            >
              <Undo2 size={15} /> Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TodoRow({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={todo}
      dragListener={false}
      dragControls={controls}
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, marginTop: 0 }}
      whileDrag={{ scale: 1.02, boxShadow: "var(--shadow-lg)" }}
      transition={spring.soft}
      className="group flex list-none items-center gap-2 rounded-xl border border-border bg-surface px-2 py-2.5"
    >
      <button
        onPointerDown={(e) => controls.start(e)}
        aria-label="Drag to reorder"
        className="flex h-9 w-8 shrink-0 cursor-grab touch-none items-center justify-center text-subtle transition-opacity active:cursor-grabbing [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
      >
        <GripVertical size={16} />
      </button>

      <Checkbox done={todo.done} onClick={() => onToggle(todo.id)} />

      <span className="relative flex-1 select-none">
        <span
          className={`text-[15px] transition-colors ${todo.done ? "text-subtle" : "text-fg"}`}
        >
          {todo.text}
        </span>
        <motion.span
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 h-[1.5px] w-full bg-subtle"
          style={{ originX: 0 }}
          initial={false}
          animate={{ scaleX: todo.done ? 1 : 0 }}
          transition={spring.snappy}
        />
      </span>

      <button
        onClick={() => onDelete(todo.id)}
        aria-label="Delete task"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-subtle transition-opacity hover:bg-surface-2 hover:text-fg cursor-pointer [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
      >
        <X size={16} />
      </button>
    </Reorder.Item>
  );
}

function Checkbox({ done, onClick }: { done: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      transition={spring.snappy}
      aria-label={done ? "Mark incomplete" : "Mark complete"}
      aria-pressed={done}
      className="flex h-6 w-6 shrink-0 items-center justify-center cursor-pointer"
    >
      <svg viewBox="0 0 24 24" width={22} height={22}>
        <motion.rect
          x="2.5"
          y="2.5"
          width="19"
          height="19"
          rx="6"
          strokeWidth="2"
          animate={{
            fill: done ? "var(--accent)" : "rgba(0,0,0,0)",
            stroke: done ? "var(--accent)" : "var(--border-strong)",
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.path
          d="M7 12.5 L10.5 16 L17 8.5"
          fill="none"
          stroke="var(--accent-fg)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        />
      </svg>
    </motion.button>
  );
}

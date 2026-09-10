"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown, RefreshCw } from "lucide-react";

export function TargetRoleForm({
  currentId,
  roles,
}: {
  currentId: string;
  roles: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [value, setValue] = useState(currentId);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex flex-col sm:flex-row items-start sm:items-stretch gap-3 w-full max-w-lg"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        await fetch("/api/employees/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetRoleId: value }),
        });
        setPending(false);
        router.refresh();
      }}
    >
      <div className="relative flex-1 w-full">
        <select
          className="auth-input w-full pl-4 pr-10 py-3 rounded-xl bg-surface-container border border-white/10 text-on-surface text-sm outline-none transition-all duration-200 focus:border-primary-container/60 focus:ring-2 focus:ring-primary-container/15 focus:bg-surface-container-high appearance-none cursor-pointer"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={pending}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id} className="bg-surface-container-high">
              {role.name}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 pointer-events-none z-10" />
      </div>
      
      <button 
        className="glow-button-secondary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-label-caps text-label-caps tracking-widest font-bold whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed" 
        disabled={pending}
      >
        {pending ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            UPDATING…
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            RECALCULATE
          </>
        )}
      </button>
    </form>
  );
}

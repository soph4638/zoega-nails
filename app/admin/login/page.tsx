"use client";

import { useActionState } from "react";
import { adminLogin, type LoginState } from "@/lib/actions/admin";

const initialState: LoginState = {};

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-16">
      <h1 className="mb-6 text-center font-serif text-3xl text-ink">Admin-login</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Kodeord</label>
          <input
            type="password"
            name="password"
            required
            autoFocus
            className="w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink"
          />
        </div>

        {state.error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-accent px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-accent-dark disabled:opacity-60"
        >
          {pending ? "Logger ind…" : "Log ind"}
        </button>
      </form>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { createPostAction } from "@/lib/actions";

const MAX = 500;

export function Composer({ userName }: { userName: string }) {
  const [len, setLen] = useState(0);
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <form
      action={async (fd) => {
        await createPostAction(fd);
        setLen(0);
        if (ref.current) ref.current.value = "";
      }}
      className="hidden items-start gap-3 border-b border-edge px-4 py-3 md:flex"
    >
      <div className="min-w-0 flex-1">
        <textarea
          ref={ref}
          name="text"
          rows={2}
          maxLength={MAX}
          onChange={(e) => setLen(e.target.value.length)}
          placeholder={`What's happening, ${userName}?`}
          className="w-full resize-none bg-transparent text-[17px] leading-7 placeholder:text-muted focus:outline-none"
        />
        <div className="flex items-center justify-end gap-3">
          <span className={`text-xs ${len > MAX - 50 ? "text-lime" : "text-muted"}`}>
            {len}/{MAX}
          </span>
          <button className="btn-primary h-9 px-4 text-sm disabled:opacity-40" disabled={len === 0}>
            Klan
          </button>
        </div>
      </div>
    </form>
  );
}

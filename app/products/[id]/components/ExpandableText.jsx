"use client";

import { useLayoutEffect, useRef, useState } from "react";

// Clamps text to `lines` lines and shows "See more" only when it actually overflows.
export default function ExpandableText({ text, lines = 3, className = "" }) {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (el && !expanded) setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [text, expanded]);

  if (!text) return null;

  return (
    <div>
      <p
        ref={ref}
        className={`whitespace-pre-line ${className}`}
        style={expanded ? undefined : { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {text}
      </p>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-[15px] font-medium text-forest underline underline-offset-2"
        >
          {expanded ? "See less" : "See more"}
        </button>
      )}
    </div>
  );
}

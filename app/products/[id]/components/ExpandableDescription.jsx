"use client";

import { useState } from "react";

export default function ExpandableDescription({ description }) {
  const [expanded, setExpanded] = useState(false);
  if (!description) return null;
  const words = description.split(/\s+/);
  const truncated = words.slice(0, 29).join(" ");
  return (
    <span className="text-gray-700">
      {expanded ? description : truncated}
      {words.length > 29 && (
        <>
          {!expanded && "... "}
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 font-medium text-filgreen text-xs hover:underline"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        </>
      )}
    </span>
  );
}
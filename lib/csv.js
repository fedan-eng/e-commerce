// lib/csv.js
// Minimal CSV builder for admin exports (opens cleanly in Excel / Google Sheets).

// Escape one cell. Strings starting with = + - @ are prefixed with ' so
// spreadsheet apps don't execute user-supplied text (e.g. a customer name) as a formula.
export function csvCell(value) {
  if (value == null) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// columns: [{ header: "Total", value: row => row.total }]
export function toCSV(rows, columns) {
  const lines = [columns.map(c => csvCell(c.header)).join(",")];
  for (const row of rows) lines.push(columns.map(c => csvCell(c.value(row))).join(","));
  return lines.join("\r\n");
}

// Browser-only: trigger a download. BOM makes Excel read UTF-8 (₦, accents) correctly.
export function downloadCSV(filename, csv) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

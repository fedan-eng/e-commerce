// lib/quietHours.js — marketing emails (cart reminders, the second welcome) wait out the night in
// Lagos and go out from 7am instead. Nigeria is UTC+1 all year (no daylight saving).
const QUIET_FROM = 22; // 10pm
const QUIET_UNTIL = 7; // 7am

export function isQuietHours(date = new Date()) {
  const lagosHour = (date.getUTCHours() + 1) % 24;
  return lagosHour >= QUIET_FROM || lagosHour < QUIET_UNTIL;
}

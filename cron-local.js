// cron-local.js — run the scheduled jobs against a local dev server (production uses vercel.json).
//   CRON_SECRET=... node cron-local.js
const cron = require("node-cron");
const axios = require("axios");

const BASE_URL = process.env.CRON_BASE_URL || "http://localhost:3000";
const JOBS = ["/api/cron/review-requests", "/api/cron/abandoned-cart"];

// Every 5 minutes, so changes can be tried quickly
cron.schedule("*/5 * * * *", async () => {
  for (const path of JOBS) {
    try {
      const res = await axios.get(`${BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
      });
      console.log(path, JSON.stringify(res.data));
    } catch (err) {
      console.error(path, "failed:", err.response?.status || err.message);
    }
  }
});

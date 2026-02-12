// cron-local.js
const cron = require("node-cron");
const axios = require("axios");

// Schedule: every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  console.log("Triggering follow-up email task...");

  try {
    const res = await axios.get(
      "http://localhost:3000/api/send-followup-emails"
    );
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error triggering API:", err.message);
  }
});

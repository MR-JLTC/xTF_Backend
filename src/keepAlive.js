'use strict';

const cron = require('node-cron');
const axios = require('axios');

/**
 * Registers the /health endpoint on the given Express-compatible app instance
 * and starts a self-ping cron job (production only) to keep the Render free-tier
 * server awake.
 *
 * @param {import('express').Application} app  - The NestJS/Express app instance
 * @param {number|string} port                 - The port the server is listening on
 */
function keepAlive(app, port) {
  // ─── Health Endpoint ────────────────────────────────────────────────────────
  // Registered BEFORE the global prefix so it is accessible at GET /health
  app.getHttpAdapter().get('/health', (req, res) => {
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  // ─── Self-Ping Cron Job (production only) ───────────────────────────────────
  if (process.env.NODE_ENV !== 'production') return;

  const baseUrl =
    process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;
  const healthUrl = `${baseUrl}/health`;

  // Run every 14 minutes: "*/14 * * * *"
  cron.schedule('*/14 * * * *', async () => {
    const timestamp = new Date().toISOString();
    console.log(`[KeepAlive] 🔄 Sending keep-alive ping to ${healthUrl}`);
    try {
      const response = await axios.get(healthUrl, { timeout: 10000 });
      const { status, uptime } = response.data;
      console.log(
        `[KeepAlive] ✅ Ping successful — ${timestamp} | Status: ${status} | Uptime: ${uptime}s`,
      );
    } catch (err) {
      console.error(
        `[KeepAlive] ❌ Ping failed — ${timestamp} | Error: ${err.message}`,
      );
    }
  });

  console.log(
    '[KeepAlive] Cron job initialized - pinging every 14 minutes',
  );
}

module.exports = keepAlive;

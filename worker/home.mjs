// Runs the worker on a home connection and publishes it through a free Cloudflare quick tunnel.
// The tunnel URL changes on every start, so it is announced to the always-on worker, which the sites ask.
// If this machine or the tunnel is down, the sites simply use the always-on worker instead.
import { spawn } from "node:child_process";
import { createWorker } from "./server.js";

const port = Number(process.env.PORT || 8787);
const registry = (process.env.FALLBACK_WORKER_URL || "https://yt1s-worker-b6abf79b9888.herokuapp.com").replace(/\/$/, "");
process.env.FALLBACK_WORKER_URL = registry;
process.env.FULL_DIRECT_STRATEGIES ||= "true";
if (!process.env.HOME_SECRET) { console.error("HOME_SECRET is required"); process.exit(1); }

const app = await createWorker();
app.listen(port, "127.0.0.1", () => console.log(`home worker listening on ${port}`));

async function register() {
  const url = process.env.PUBLIC_WORKER_URL;
  if (!url) return;
  try {
    const response = await fetch(`${registry}/home/register`, {
      method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.HOME_SECRET}` },
      body: JSON.stringify({ url }), signal: AbortSignal.timeout(10000)
    });
    if (!response.ok) console.error("register failed", response.status);
  } catch (error) { console.error("register error", error.message); }
}

function startTunnel() {
  const child = spawn(process.env.CLOUDFLARED_BIN || "cloudflared", ["tunnel", "--no-autoupdate", "--url", `http://127.0.0.1:${port}`], { stdio: ["ignore", "ignore", "pipe"] });
  child.stderr.on("data", (chunk) => {
    const text = String(chunk);
    if (/(ERR|WRN)/.test(text)) console.error("cloudflared:", text.replace(/\s+/g, " ").slice(0, 300));
    // cloudflared also prints its own API address (api.trycloudflare.com); only the assigned tunnel counts.
    const match = [...text.matchAll(/https:\/\/([a-z0-9-]+)\.trycloudflare\.com/g)].find((m) => m[1] !== "api");
    if (match && process.env.PUBLIC_WORKER_URL !== match[0]) {
      process.env.PUBLIC_WORKER_URL = match[0];
      console.log("tunnel up:", match[0]);
      void register();
    }
  });
  child.on("error", (error) => { console.error("cloudflared error:", error.message); setTimeout(startTunnel, 15000); });
  child.on("close", () => { process.env.PUBLIC_WORKER_URL = ""; console.log("tunnel closed, restarting"); setTimeout(startTunnel, 5000); });
}
startTunnel();
setInterval(register, 60000);

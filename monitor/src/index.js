// yt1s monitor: every 20 minutes runs a real download on each site and posts to Discord when one fails.
// Secrets (set with `wrangler secret put`): DISCORD_WEBHOOK_URL (alerts), RUN_KEY (manual /run trigger).

const WORKER = "https://yt1s-worker-b6abf79b9888.herokuapp.com";
const BACKUP = "https://yt1s-worker-eu-b88ee7e26698.herokuapp.com";
const POLLS = 10;
const POLL_MS = 6000;
const REMIND_MS = 6 * 60 * 60 * 1000;

// Different video/quality per site so the worker's 10 minute job cache cannot make one test reuse another.
const SITES = [
  { name: "yt1s.video", base: "https://yt1s.video", video: "jNQXAC9IVRw", quality: "360p" },
  { name: "yt1s.ink", base: "https://yt1s.ink", video: "dQw4w9WgXcQ", quality: "360p" },
  { name: "yt1s.shop", base: "https://yt1s.shop", video: "jNQXAC9IVRw", quality: "audio", binding: "SHOP" }
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function checkSite(site, env) {
  const started = Date.now();
  // A Worker cannot fetch another Worker on its own zone by hostname, so yt1s.shop is reached by service binding.
  const call = (path, init) => (site.binding && env[site.binding]
    ? env[site.binding].fetch(`${site.base}${path}`, init)
    : fetch(`${site.base}${path}`, init));
  const result = (ok, stage, detail) => ({ name: site.name, ok, stage, detail, seconds: Math.round((Date.now() - started) / 1000) });
  try {
    const start = await call("/api/worker-download", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${site.video}`, quality: site.quality }),
      signal: AbortSignal.timeout(25000)
    });
    const first = await start.json().catch(() => null);
    const jobId = first?.jobId || first?.id;
    if (!jobId) return result(false, "start", `HTTP ${start.status} ${first?.error || first?.code || "no jobId"}`);

    let job = first;
    for (let poll = 0; poll < POLLS && !["completed", "failed"].includes(job?.status); poll++) {
      await sleep(POLL_MS);
      const response = await call(`/api/worker-download?jobId=${encodeURIComponent(jobId)}`, { signal: AbortSignal.timeout(20000) });
      job = await response.json().catch(() => null);
    }
    if (job?.status === "failed") return result(false, "prepare", `${job.code || "failed"} ${job.error || ""}`.trim());
    if (job?.status !== "completed" || !job.downloadUrl) return result(false, "prepare", `timeout, status ${job?.status || "unknown"} (attempt ${job?.attempt ?? "?"})`);

    // Read the first bytes of the real file: proves the link and the whole relay/stream path work.
    const stream = await fetch(job.downloadUrl, { signal: AbortSignal.timeout(45000) });
    const type = stream.headers.get("content-type") || "";
    if (!stream.ok || !/video|audio/.test(type)) return result(false, "stream", `HTTP ${stream.status} ${type}`);
    const reader = stream.body.getReader();
    let bytes = 0;
    while (bytes < 65536) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.length;
    }
    await reader.cancel().catch(() => {});
    if (bytes < 1024) return result(false, "stream", `only ${bytes} bytes`);
    return result(true, "ok", `${bytes} bytes read`);
  } catch (error) {
    return result(false, "error", String(error?.message || error).slice(0, 120));
  }
}

async function workerHealth(base = WORKER) {
  try {
    const health = await (await fetch(`${base}/health`, { signal: AbortSignal.timeout(15000) })).json();
    return { ok: Boolean(health.ok), warp: health.warp, agentOnline: health.agentOnline, cookies: health.healthyCookieAccounts, agent: health.agentOnline };
  } catch { return { ok: false }; }
}

async function discord(env, embed) {
  if (!env.DISCORD_WEBHOOK_URL) { console.log("DISCORD_WEBHOOK_URL not set; would send:", JSON.stringify(embed)); return false; }
  const response = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "yt1s monitor", embeds: [{ ...embed, timestamp: new Date().toISOString() }] })
  });
  return response.ok;
}

const describe = (health) => (health.ok
  ? `Heroku worker OK · ghar ka agent: ${health.agentOnline ? "online" : "OFFLINE (PC band?)"} · WARP: ${health.warp ? "up" : "down"} · cookie accounts healthy: ${health.cookies}`
  : "Heroku worker ka /health jawab nahi de raha");

async function run(env) {
  const [health, backup, first] = await Promise.all([workerHealth(), workerHealth(BACKUP), Promise.all(SITES.map((site) => checkSite(site, env)))]);
  let results = first;
  // One quick retry when a single site failed, to ignore a one-off blip. Skipped if several failed (a real outage).
  const failed = results.filter((r) => !r.ok);
  if (failed.length === 1) {
    const site = SITES.find((s) => s.name === failed[0].name);
    const again = await checkSite({ ...site, quality: site.quality === "audio" ? "360p" : "audio" }, env);
    if (again.ok) results = results.map((r) => (r.name === again.name ? { ...again, detail: `${again.detail} (retry ok)` } : r));
  }

  const raw = await env.STATE.get("state");
  const previous = raw ? JSON.parse(raw) : null;
  const now = Date.now();
  const state = {};
  const alerts = [], recoveries = [];
  for (const r of results) {
    const before = previous?.[r.name];
    state[r.name] = { ok: r.ok, since: before && before.ok === r.ok ? before.since : now, lastAlert: before?.lastAlert || 0 };
    if (!r.ok && (!before || before.ok || now - (before.lastAlert || 0) > REMIND_MS)) { alerts.push(r); state[r.name].lastAlert = now; }
    if (r.ok && before && !before.ok) recoveries.push({ ...r, downMinutes: Math.round((now - before.since) / 60000) });
  }
  // Both workers are watched: the main one (US) and the standby (EU) that the sites switch to automatically.
  for (const [label, key, h] of [["Heroku worker (main, US)", "_worker_down", health], ["Heroku worker (standby, EU)", "_backup_down", backup]]) {
    if (!h.ok && !previous?.[key]) { state[key] = true; alerts.push({ name: label, stage: "health", detail: "/health jawab nahi de raha", seconds: 0 }); }
    else if (h.ok && previous?.[key]) recoveries.push({ name: label, detail: "wapas theek", downMinutes: 0 });
    else if (!h.ok) state[key] = true;
  }

  if (alerts.length) {
    await discord(env, {
      title: "🔴 Downloader fail ho raha hai",
      color: 0xe53935,
      description: alerts.map((r) => `**${r.name}** — stage \`${r.stage}\`: ${r.detail}`).join("\n"),
      fields: [{ name: "Status", value: describe(health) }, { name: "Standby (EU)", value: backup.ok ? "OK" : "DOWN" }, { name: "Baaki sites", value: results.map((r) => `${r.ok ? "✅" : "❌"} ${r.name} (${r.seconds}s)`).join("\n") }]
    });
  }
  if (recoveries.length) {
    await discord(env, {
      title: "🟢 Wapas theek ho gaya",
      color: 0x43a047,
      description: recoveries.map((r) => `**${r.name}** — theek hai${r.downMinutes ? ` (${r.downMinutes} minute band raha)` : ""}`).join("\n"),
      fields: [{ name: "Status", value: describe(health) }]
    });
  }
  if (!previous) {
    await discord(env, {
      title: "👀 Monitoring chalu",
      color: 0x1e88e5,
      description: "Har 20 minute mein teeno sites ka asli download test hoga. Fail hone par yahan message aayega.",
      fields: [{ name: "Pehla result", value: results.map((r) => `${r.ok ? "✅" : "❌"} ${r.name} (${r.seconds}s) ${r.ok ? "" : r.detail}`).join("\n") }, { name: "Status", value: describe(health) }]
    });
  }
  // Without a webhook this is only a dry run, so keep the state empty and let the first real run announce itself.
  if (env.DISCORD_WEBHOOK_URL) await env.STATE.put("state", JSON.stringify(state));
  return { health, results, alerts: alerts.length, recoveries: recoveries.length };
}

export default {
  async scheduled(event, env, ctx) { ctx.waitUntil(run(env)); },
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/run" && env.RUN_KEY && request.headers.get("x-run-key") === env.RUN_KEY) {
      if (url.searchParams.get("test") === "1") {
        const sent = await discord(env, { title: "🧪 Test alert", color: 0xfb8c00, description: "Ye sirf test message hai. Asli fail hone par aise hi yahan aayega.", fields: [{ name: "Status", value: describe(await workerHealth()) }] });
        return Response.json({ sent });
      }
      return Response.json(await run(env));
    }
    return new Response("yt1s monitor", { status: 200 });
  }
};

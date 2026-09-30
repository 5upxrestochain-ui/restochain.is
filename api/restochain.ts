import type { IncomingMessage, ServerResponse } from "node:http";
import { CloudflareD1 } from "../server/db.ts";
import { createApp } from "../server/app.ts";

/** Works as a Vercel Node Function and as the Vite development middleware. */
export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID || "";
  const database = process.env.CLOUDFLARE_DATABASE_ID || "";
  const token = process.env.CLOUDFLARE_API_TOKEN || "";
  const origin = process.env.APP_ORIGIN || "";
  const configured = !!(account && database && token && origin);
  const app = createApp(
    configured ? new CloudflareD1(account, database, token) : null,
    {
      origin,
      secureCookie: !origin.startsWith("http://localhost:"),
      allowRegistration: process.env.ALLOW_REGISTRATION === "true",
      signupCode: process.env.SIGNUP_CODE || "",
    },
  );
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined)
        headers.set(key, Array.isArray(value) ? value.join(", ") : value);
    }
    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      if (req.body !== undefined)
        body =
          typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      else {
        const chunks: Buffer[] = [];
        let size = 0;
        for await (const chunk of req) {
          size += Buffer.byteLength(chunk);
          if (size > 65536) {
            res.writeHead(413, { "Content-Type": "application/json" });
            res.end('{"error":"Yêu cầu quá lớn."}');
            return;
          }
          chunks.push(Buffer.from(chunk));
        }
        body = Buffer.concat(chunks).toString("utf8");
      }
    }
    const request = new Request(
      "https://restochain.internal" + (req.url || "/api/restochain"),
      { method: req.method || "GET", headers, body },
    );
    const response = await app(request);
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(await response.text());
  } catch {
    res.writeHead(400, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    res.end('{"error":"Yêu cầu không hợp lệ."}');
  }
}

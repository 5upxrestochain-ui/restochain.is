export type Statement = { sql: string; params?: (string | number | null)[] };
export type Result = {
  results: Record<string, unknown>[];
  meta?: { changes?: number };
  success?: boolean;
};
export interface Database {
  batch(statements: Statement[]): Promise<Result[]>;
}

/** Server-only adapter. Never import this module into the browser bundle. */
export class CloudflareD1 implements Database {
  constructor(
    private account: string,
    private database: string,
    private token: string,
  ) {}
  async batch(statements: Statement[]): Promise<Result[]> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(this.account)}/d1/database/${encodeURIComponent(this.database)}/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ batch: statements }),
        signal: AbortSignal.timeout(12000),
      },
    );
    const data = (await response.json()) as {
      success?: boolean;
      result?: Result[];
    };
    if (
      !response.ok ||
      !data.success ||
      !Array.isArray(data.result) ||
      data.result.some((r) => r.success === false)
    ) {
      // Do not echo provider errors, SQL, tokens or customer data into HTTP responses.
      throw new Error("DATABASE_UNAVAILABLE");
    }
    return data.result;
  }
}

export async function query(
  db: Database,
  sql: string,
  params: Statement["params"] = [],
) {
  const [result] = await db.batch([{ sql, params }]);
  return result.results;
}

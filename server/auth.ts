import {
  createHash,
  randomBytes,
  scrypt as derive,
  timingSafeEqual,
} from "node:crypto";

export const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const sessionToken = () => randomBytes(32).toString("hex");
const scrypt = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) => {
    derive(
      password,
      salt,
      64,
      { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
      (error, key) => (error ? reject(error) : resolve(key)),
    );
  });
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt$${salt}$${(await scrypt(password, salt)).toString("hex")}`;
}
export async function checkPassword(password: string, stored: string) {
  const [algorithm, salt, hash] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !/^[a-f0-9]{128}$/.test(hash || ""))
    return false;
  const actual = await scrypt(password, salt);
  return timingSafeEqual(actual, Buffer.from(hash, "hex"));
}
export const equalSecret = (a: string, b: string) =>
  timingSafeEqual(Buffer.from(digest(a)), Buffer.from(digest(b)));

/**
 * @see https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP
 */
const kDefaultCodes = new Set([307, 408, 429, 444, 500, 503, 504, 520, 521, 522, 523, 524]);

export function httpcode(codes: Set<number> = kDefaultCodes, useDefault = false) {
  if (useDefault) {
    [...kDefaultCodes].forEach((code) => codes.add(code));
  }

  return ({ statusCode }) => !codes.has(statusCode);
}

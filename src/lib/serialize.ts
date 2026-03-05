// src/lib/serialize.ts

/**
 * Recursively converts Prisma Decimal, Date, and BigInt
 * to plain JS types so they can be passed to Client Components.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      // Handle Decimal
      if (
        value !== null &&
        typeof value === "object" &&
        "toNumber" in value &&
        typeof value.toNumber === "function"
      ) {
        return value.toNumber();
      }
      // Handle BigInt
      if (typeof value === "bigint") {
        return Number(value);
      }
      return value;
    }),
  );
}

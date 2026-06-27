// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Neon's serverless driver talks to Postgres over WebSockets. In an edge
// runtime the WebSocket is built in, but under Node (e.g. `next dev` / a Node
// server) we have to hand it the implementation explicitly.
neonConfig.webSocketConstructor = ws;

type GlobalForPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalForPrisma;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Missing DATABASE_URL");
  return url;
}

function createClient() {
  // @prisma/adapter-neon v7 takes a PoolConfig and owns the pool internally —
  // passing a pre-built Pool here is what made it fall back to localhost.
  const adapter = new PrismaNeon({ connectionString: getDatabaseUrl() });
  return new PrismaClient({ adapter, log: ["error"] });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

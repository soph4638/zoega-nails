import { PrismaClient } from "@prisma/client";

// Next.js genindlæser filer under udvikling, hvilket ellers ville oprette en ny
// PrismaClient (og dermed en ny database-forbindelse) ved hvert filskift.
// Vi gemmer derfor klienten globalt, så den genbruges.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

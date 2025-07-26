/*
  Warnings:

  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Slide` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SlideItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Question";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Slide";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "SlideItem";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Station" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Ore" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stationId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "batchRef" TEXT NOT NULL,
    "weightTon" REAL NOT NULL,
    "gradeCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Ore_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "Station" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ore_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OreTransport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "oreId" INTEGER NOT NULL,
    "fromStationId" INTEGER NOT NULL,
    "toStationId" INTEGER NOT NULL,
    "truckNo" TEXT NOT NULL,
    "weightTon" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "departedAt" DATETIME NOT NULL,
    "receivedAt" DATETIME,
    CONSTRAINT "OreTransport_oreId_fkey" FOREIGN KEY ("oreId") REFERENCES "Ore" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OreTransport_fromStationId_fkey" FOREIGN KEY ("fromStationId") REFERENCES "Station" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OreTransport_toStationId_fkey" FOREIGN KEY ("toStationId") REFERENCES "Station" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

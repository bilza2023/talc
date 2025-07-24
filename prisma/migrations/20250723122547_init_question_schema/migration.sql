/*
  Warnings:

  - You are about to drop the `Deck` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Deck";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Question" (
    "filename" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "description" TEXT,
    "tags" TEXT,
    "status" TEXT,
    "timed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" DATETIME NOT NULL,
    "deck" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Slide" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question_filename" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "start" REAL NOT NULL,
    "end" REAL NOT NULL,
    "dataJson" JSONB NOT NULL,
    CONSTRAINT "Slide_question_filename_fkey" FOREIGN KEY ("question_filename") REFERENCES "Question" ("filename") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SlideItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slideId" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "showAt" REAL,
    "textContent" TEXT,
    "numValue" REAL,
    "label" TEXT,
    "imageUrl" TEXT,
    "colorHex" TEXT,
    "typeHint" TEXT,
    "extraJson" JSONB,
    CONSTRAINT "SlideItem_slideId_fkey" FOREIGN KEY ("slideId") REFERENCES "Slide" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

/*
  Warnings:

  - You are about to alter the column `tags` on the `Question` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Question" (
    "filename" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "description" TEXT,
    "tags" JSONB,
    "status" TEXT,
    "timed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" DATETIME NOT NULL,
    "deck" JSONB NOT NULL
);
INSERT INTO "new_Question" ("createdAt", "deck", "description", "editedAt", "filename", "name", "status", "tags", "timed") SELECT "createdAt", "deck", "description", "editedAt", "filename", "name", "status", "tags", "timed" FROM "Question";
DROP TABLE "Question";
ALTER TABLE "new_Question" RENAME TO "Question";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

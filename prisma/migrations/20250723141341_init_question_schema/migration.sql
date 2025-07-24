/*
  Warnings:

  - You are about to drop the column `dataJson` on the `Slide` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Slide" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "question_filename" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "start" REAL NOT NULL,
    "end" REAL NOT NULL,
    CONSTRAINT "Slide_question_filename_fkey" FOREIGN KEY ("question_filename") REFERENCES "Question" ("filename") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Slide" ("end", "id", "index", "question_filename", "start", "type") SELECT "end", "id", "index", "question_filename", "start", "type" FROM "Slide";
DROP TABLE "Slide";
ALTER TABLE "new_Slide" RENAME TO "Slide";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

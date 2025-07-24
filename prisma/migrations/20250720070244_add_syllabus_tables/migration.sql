-- CreateTable
CREATE TABLE "Tcode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tcodeName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "tcodeId" INTEGER,
    CONSTRAINT "Chapter_tcodeId_fkey" FOREIGN KEY ("tcodeId") REFERENCES "Tcode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "chapterId" INTEGER,
    "deckFilename" TEXT,
    CONSTRAINT "Exercise_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Exercise_deckFilename_fkey" FOREIGN KEY ("deckFilename") REFERENCES "Deck" ("filename") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tcode_tcodeName_key" ON "Tcode"("tcodeName");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_filename_key" ON "Chapter"("filename");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_filename_key" ON "Exercise"("filename");

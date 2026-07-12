-- CreateTable
CREATE TABLE "DailyUpdate" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyUpdate_authorId_date_key" ON "DailyUpdate"("authorId", "date");

-- AddForeignKey
ALTER TABLE "DailyUpdate" ADD CONSTRAINT "DailyUpdate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Play" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "process" JSONB,

    CONSTRAINT "Play_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Play_id_key" ON "Play"("id");

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

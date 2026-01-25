-- CreateEnum
CREATE TYPE "DataSensitivity" AS ENUM ('PUBLIC', 'INTERNAL', 'SENSITIVE', 'PII', 'PHI');

-- CreateTable
CREATE TABLE "DataOwner" (
    "id" TEXT NOT NULL,
    "teamName" VARCHAR(100) NOT NULL,
    "contactEmail" VARCHAR(255) NOT NULL,
    "slackChannel" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "domain" VARCHAR(100) NOT NULL,
    "ownerTeam" TEXT NOT NULL,
    "sensitivity" "DataSensitivity" NOT NULL DEFAULT 'INTERNAL',
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatasetField" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "isNullable" BOOLEAN NOT NULL DEFAULT true,
    "sensitivity" "DataSensitivity" NOT NULL DEFAULT 'INTERNAL',
    "examples" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DatasetField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessGlossaryTerm" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "definition" TEXT NOT NULL,
    "examples" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessGlossaryTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatasetGlossaryTerm" (
    "id" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "termId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatasetGlossaryTerm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DataOwner_teamName_key" ON "DataOwner"("teamName");

-- CreateIndex
CREATE INDEX "DataOwner_teamName_idx" ON "DataOwner"("teamName");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_name_key" ON "Dataset"("name");

-- CreateIndex
CREATE INDEX "Dataset_domain_idx" ON "Dataset"("domain");

-- CreateIndex
CREATE INDEX "Dataset_sensitivity_idx" ON "Dataset"("sensitivity");

-- CreateIndex
CREATE INDEX "Dataset_name_idx" ON "Dataset"("name");

-- CreateIndex
CREATE INDEX "Dataset_ownerTeam_idx" ON "Dataset"("ownerTeam");

-- CreateIndex
CREATE INDEX "Dataset_createdAt_idx" ON "Dataset"("createdAt");

-- CreateIndex
CREATE INDEX "DatasetField_datasetId_idx" ON "DatasetField"("datasetId");

-- CreateIndex
CREATE INDEX "DatasetField_sensitivity_idx" ON "DatasetField"("sensitivity");

-- CreateIndex
CREATE INDEX "DatasetField_name_idx" ON "DatasetField"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DatasetField_datasetId_name_key" ON "DatasetField"("datasetId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessGlossaryTerm_name_key" ON "BusinessGlossaryTerm"("name");

-- CreateIndex
CREATE INDEX "BusinessGlossaryTerm_name_idx" ON "BusinessGlossaryTerm"("name");

-- CreateIndex
CREATE INDEX "DatasetGlossaryTerm_datasetId_idx" ON "DatasetGlossaryTerm"("datasetId");

-- CreateIndex
CREATE INDEX "DatasetGlossaryTerm_termId_idx" ON "DatasetGlossaryTerm"("termId");

-- CreateIndex
CREATE UNIQUE INDEX "DatasetGlossaryTerm_datasetId_termId_key" ON "DatasetGlossaryTerm"("datasetId", "termId");

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_ownerTeam_fkey" FOREIGN KEY ("ownerTeam") REFERENCES "DataOwner"("teamName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetField" ADD CONSTRAINT "DatasetField_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetGlossaryTerm" ADD CONSTRAINT "DatasetGlossaryTerm_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatasetGlossaryTerm" ADD CONSTRAINT "DatasetGlossaryTerm_termId_fkey" FOREIGN KEY ("termId") REFERENCES "BusinessGlossaryTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

/*
  Warnings:

  - A unique constraint covering the columns `[login]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Account_login_key" ON "Account"("login");

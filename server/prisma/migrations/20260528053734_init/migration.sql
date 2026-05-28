-- CreateTable
CREATE TABLE "students" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "student_no" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "total_earned" INTEGER NOT NULL DEFAULT 0,
    "total_spent" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "admins" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "task_rules" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "description" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "point_applications" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" INTEGER NOT NULL,
    "task_rule_id" INTEGER,
    "task_description" TEXT NOT NULL,
    "points_applied" INTEGER NOT NULL,
    "evidence_url" TEXT,
    "status" INTEGER NOT NULL DEFAULT 0,
    "reviewer_id" INTEGER,
    "review_comment" TEXT,
    "reviewed_at" DATETIME,
    "idempotency_key" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "point_applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "point_applications_task_rule_id_fkey" FOREIGN KEY ("task_rule_id") REFERENCES "task_rules" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "point_applications_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "point_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "source_type" TEXT NOT NULL,
    "source_id" INTEGER,
    "operator_id" INTEGER,
    "remark" TEXT NOT NULL DEFAULT '',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "point_records_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "point_records_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resources" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "points_required" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "total_stock" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "exchange_orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "student_id" INTEGER NOT NULL,
    "resource_id" INTEGER NOT NULL,
    "points_cost" INTEGER NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "handler_id" INTEGER,
    "handled_at" DATETIME,
    "idempotency_key" TEXT NOT NULL,
    "cancel_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "exchange_orders_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exchange_orders_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "exchange_orders_handler_id_fkey" FOREIGN KEY ("handler_id") REFERENCES "admins" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "operation_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "admin_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" INTEGER,
    "detail" TEXT,
    "ip" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "operation_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "students_student_no_key" ON "students"("student_no");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "point_applications_idempotency_key_key" ON "point_applications"("idempotency_key");

-- CreateIndex
CREATE INDEX "point_applications_student_id_idx" ON "point_applications"("student_id");

-- CreateIndex
CREATE INDEX "point_applications_status_idx" ON "point_applications"("status");

-- CreateIndex
CREATE INDEX "point_records_student_id_idx" ON "point_records"("student_id");

-- CreateIndex
CREATE INDEX "point_records_type_idx" ON "point_records"("type");

-- CreateIndex
CREATE INDEX "point_records_source_type_source_id_idx" ON "point_records"("source_type", "source_id");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_orders_idempotency_key_key" ON "exchange_orders"("idempotency_key");

-- CreateIndex
CREATE INDEX "exchange_orders_student_id_idx" ON "exchange_orders"("student_id");

-- CreateIndex
CREATE INDEX "exchange_orders_resource_id_idx" ON "exchange_orders"("resource_id");

-- CreateIndex
CREATE INDEX "exchange_orders_status_idx" ON "exchange_orders"("status");

-- CreateIndex
CREATE INDEX "operation_logs_admin_id_idx" ON "operation_logs"("admin_id");

-- CreateIndex
CREATE INDEX "operation_logs_action_idx" ON "operation_logs"("action");

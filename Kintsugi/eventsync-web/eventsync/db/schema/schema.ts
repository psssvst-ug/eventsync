import {
    pgTable,
    text,
    timestamp,
    foreignKey,
    unique,
    boolean,
    uuid,
    jsonb,
    integer,
    decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const verification = pgTable("verification", {
    id: text().primaryKey().notNull(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
});

export const account = pgTable(
    "account",
    {
        id: text().primaryKey().notNull(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id").notNull(),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at", {
            mode: "string",
        }),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
            mode: "string",
        }),
        scope: text(),
        password: text(),
        createdAt: timestamp("created_at", { mode: "string" }).notNull(),
        updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "account_user_id_user_id_fk",
        }).onDelete("cascade"),
    ],
);

export const session = pgTable(
    "session",
    {
        id: text().primaryKey().notNull(),
        expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
        token: text().notNull(),
        createdAt: timestamp("created_at", { mode: "string" }).notNull(),
        updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id").notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "session_user_id_user_id_fk",
        }).onDelete("cascade"),
        unique("session_token_unique").on(table.token),
    ],
);

export const user = pgTable(
    "user",
    {
        id: text().primaryKey().notNull(),
        name: text().notNull(),
        email: text().notNull(),
        emailVerified: boolean("email_verified").notNull(),
        image: text(),
        createdAt: timestamp("created_at", { mode: "string" }).notNull(),
        updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
        role: text().default("user").notNull(),
        banned: boolean("banned").default(false),
        banReason: text("ban_reason"),
        banExpires: timestamp("ban_expires", { mode: "string" }),
    },
    (table) => [unique("user_email_unique").on(table.email)],
);

export const team = pgTable("team", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    createdBy: text("created_by")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "string" })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
        .defaultNow()
        .notNull(),
});

export const teamMember = pgTable(
    "team_member",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        teamId: uuid("team_id")
            .notNull()
            .references(() => team.id, { onDelete: "cascade" }),
        email: text("email").notNull(),
        name: text("name"),
        userId: text("user_id").references(() => user.id, {
            onDelete: "set null",
        }),
        role: text("role").default("member").notNull(), // 'leader' or 'member'
        status: text("status").default("pending").notNull(), // 'pending', 'accepted', 'declined'
        invitedAt: timestamp("invited_at", { mode: "string" })
            .defaultNow()
            .notNull(),
        joinedAt: timestamp("joined_at", { mode: "string" }),
        createdAt: timestamp("created_at", { mode: "string" })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { mode: "string" })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        unique("team_member_team_email_unique").on(table.teamId, table.email),
    ],
);

export const event = pgTable("event", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    teamId: uuid("team_id").references(() => team.id, { onDelete: "cascade" }),
    managerId: text("manager_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    startDate: timestamp("start_date", { mode: "string" }).notNull(),
    endDate: timestamp("end_date", { mode: "string" }),
    location: text("location"),
    maxCapacity: integer("max_capacity"),
    minTeamSize: integer("min_team_size").default(1),
    maxTeamSize: integer("max_team_size").default(5),
    registrationDeadline: timestamp("registration_deadline", {
        mode: "string",
    }),
    status: text("status").default("draft").notNull(),
    imageUrl: text("image_url"),
    page: jsonb("page"),
    createdAt: timestamp("created_at", { mode: "string" })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
        .defaultNow()
        .notNull(),
});

export const registration = pgTable(
    "registration",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        eventId: uuid("event_id")
            .notNull()
            .references(() => event.id, { onDelete: "cascade" }),
        teamId: uuid("team_id")
            .notNull()
            .references(() => team.id, { onDelete: "cascade" }),
        status: text("status").default("confirmed").notNull(),
        registeredAt: timestamp("registered_at", { mode: "string" })
            .defaultNow()
            .notNull(),
        checkedInAt: timestamp("checked_in_at", { mode: "string" }),
        cancelledAt: timestamp("cancelled_at", { mode: "string" }),
        formData: jsonb("form_data"),
        createdAt: timestamp("created_at", { mode: "string" })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { mode: "string" })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        unique("registration_event_team_unique").on(
            table.eventId,
            table.teamId,
        ),
    ],
);

export const transaction = pgTable(
    "transaction",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        registrationId: uuid("registration_id")
            .notNull()
            .references(() => registration.id, { onDelete: "cascade" }),
        userId: text("user_id")
            .notNull()
            .references(() => user.id, { onDelete: "cascade" }),
        amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
        currency: text("currency").default("USD").notNull(),
        status: text("status").default("pending").notNull(),
        paymentMethod: text("payment_method"),
        transactionReference: text("transaction_reference"),
        metadata: jsonb("metadata"),
        createdAt: timestamp("created_at", { mode: "string" })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { mode: "string" })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        foreignKey({
            columns: [table.registrationId],
            foreignColumns: [registration.id],
            name: "transaction_registration_id_registration_id_fk",
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "transaction_user_id_user_id_fk",
        }).onDelete("cascade"),
    ],
);

export const managerApplications = pgTable("manager_applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    organizationName: text("organization_name").notNull(),
    organizationType: text("organization_type").notNull(),
    contactPhone: text("contact_phone").notNull(),
    website: text("website"),
    description: text("description").notNull(),
    experience: text("experience").notNull(),
    status: text("status").default("pending").notNull(), // pending, approved, rejected
    adminNotes: text("admin_notes"),
    reviewedBy: text("reviewed_by").references(() => user.id),
    reviewedAt: timestamp("reviewed_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
        .defaultNow()
        .notNull(),
});

// Relations
export const managerApplicationsRelations = relations(
    managerApplications,
    ({ one }) => ({
        user: one(user, {
            fields: [managerApplications.userId],
            references: [user.id],
        }),
        reviewer: one(user, {
            fields: [managerApplications.reviewedBy],
            references: [user.id],
        }),
    }),
);

export const userRelations = relations(user, ({ many }) => ({
    managerApplications: many(managerApplications),
    teamsCreated: many(team),
    teamMemberships: many(teamMember),
}));

export const teamRelations = relations(team, ({ one, many }) => ({
    creator: one(user, {
        fields: [team.createdBy],
        references: [user.id],
    }),
    members: many(teamMember),
    registrations: many(registration),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
    team: one(team, {
        fields: [teamMember.teamId],
        references: [team.id],
    }),
    user: one(user, {
        fields: [teamMember.userId],
        references: [user.id],
    }),
}));

export const eventRelations = relations(event, ({ one, many }) => ({
    manager: one(user, {
        fields: [event.managerId],
        references: [user.id],
    }),
    registrations: many(registration),
}));

export const registrationRelations = relations(
    registration,
    ({ one, many }) => ({
        event: one(event, {
            fields: [registration.eventId],
            references: [event.id],
        }),
        team: one(team, {
            fields: [registration.teamId],
            references: [team.id],
        }),
        transactions: many(transaction),
    }),
);

export const transactionRelations = relations(transaction, ({ one }) => ({
    registration: one(registration, {
        fields: [transaction.registrationId],
        references: [registration.id],
    }),
    user: one(user, {
        fields: [transaction.userId],
        references: [user.id],
    }),
}));

export const eventMessage = pgTable("event_message", {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
        .notNull()
        .references(() => event.id, { onDelete: "cascade" }),
    managerId: text("manager_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    priority: text("priority").default("normal").notNull(), // 'low', 'normal', 'high', 'urgent'
    createdAt: timestamp("created_at", { mode: "string" })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
        .defaultNow()
        .notNull(),
});

export const attendanceTracking = pgTable("attendance_tracking", {
    id: uuid("id").primaryKey().defaultRandom(),
    eventId: uuid("event_id")
        .notNull()
        .references(() => event.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
        .notNull()
        .references(() => team.id, { onDelete: "cascade" }),
    memberId: uuid("member_id").references(() => teamMember.id, {
        onDelete: "cascade",
    }), // Optional: for per-member QR codes
    trackingType: text("tracking_type").notNull(), // 'attendance', 'food_coupon', 'custom'
    label: text("label").notNull(), // e.g., "Day 1 Attendance", "Lunch Coupon"
    qrCodeData: text("qr_code_data"), // Stored QR code data URL
    scannedAt: timestamp("scanned_at", { mode: "string" }),
    scannedBy: text("scanned_by").references(() => user.id, {
        onDelete: "set null",
    }),
    metadata: jsonb("metadata"), // Additional tracking data
    createdAt: timestamp("created_at", { mode: "string" })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" })
        .defaultNow()
        .notNull(),
});

export const eventMessageRelations = relations(eventMessage, ({ one }) => ({
    event: one(event, {
        fields: [eventMessage.eventId],
        references: [event.id],
    }),
    manager: one(user, {
        fields: [eventMessage.managerId],
        references: [user.id],
    }),
}));

export const attendanceTrackingRelations = relations(
    attendanceTracking,
    ({ one }) => ({
        event: one(event, {
            fields: [attendanceTracking.eventId],
            references: [event.id],
        }),
        team: one(team, {
            fields: [attendanceTracking.teamId],
            references: [team.id],
        }),
        scannedByUser: one(user, {
            fields: [attendanceTracking.scannedBy],
            references: [user.id],
        }),
    }),
);

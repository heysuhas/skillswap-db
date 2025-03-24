"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = exports.insertQuizAttemptSchema = exports.quizAttempts = exports.insertQuizQuestionSchema = exports.quizQuestions = exports.insertQuizSchema = exports.quizzes = exports.insertSessionSchema = exports.sessions = exports.insertMessageSchema = exports.messages = exports.insertMatchSchema = exports.matches = exports.insertUserSkillSchema = exports.userSkills = exports.insertSkillSchema = exports.skills = exports.insertUserSchema = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// User model
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    username: (0, pg_core_1.text)("username").notNull(),
    password: (0, pg_core_1.text)("password").notNull(),
    profilePicture: (0, pg_core_1.text)("profile_picture"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).omit({
    id: true,
    createdAt: true,
});
// Skills model
exports.skills = (0, pg_core_1.pgTable)("skills", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    category: (0, pg_core_1.text)("category").notNull(),
});
exports.insertSkillSchema = (0, drizzle_zod_1.createInsertSchema)(exports.skills).omit({
    id: true,
});
// UserSkills model - for mapping skills to users
exports.userSkills = (0, pg_core_1.pgTable)("user_skills", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    skillId: (0, pg_core_1.integer)("skill_id").notNull().references(() => exports.skills.id),
    proficiency: (0, pg_core_1.text)("proficiency").notNull(), // 'beginner', 'intermediate', 'advanced'
    isTeaching: (0, pg_core_1.boolean)("is_teaching").notNull(), // true if user is teaching, false if learning
    isVerified: (0, pg_core_1.boolean)("is_verified").default(false),
});
exports.insertUserSkillSchema = (0, drizzle_zod_1.createInsertSchema)(exports.userSkills).omit({
    id: true,
});
// Matches model - for skill-based matches between users
exports.matches = (0, pg_core_1.pgTable)("matches", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    user1Id: (0, pg_core_1.integer)("user1_id").notNull().references(() => exports.users.id),
    user2Id: (0, pg_core_1.integer)("user2_id").notNull().references(() => exports.users.id),
    matchScore: (0, pg_core_1.integer)("match_score").notNull(), // Percentage match (0-100)
    status: (0, pg_core_1.text)("status").notNull(), // 'pending', 'accepted', 'rejected'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertMatchSchema = (0, drizzle_zod_1.createInsertSchema)(exports.matches).omit({
    id: true,
    createdAt: true,
});
// Messages model - for chat between matched users
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    matchId: (0, pg_core_1.integer)("match_id").notNull().references(() => exports.matches.id),
    senderId: (0, pg_core_1.integer)("sender_id").notNull().references(() => exports.users.id),
    content: (0, pg_core_1.text)("content").notNull(),
    messageType: (0, pg_core_1.text)("message_type").notNull().default("text"), // "text", "image", "voice"
    mediaUrl: (0, pg_core_1.text)("media_url"), // URL to image or voice file (if applicable)
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertMessageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.messages).omit({
    id: true,
    createdAt: true,
});
// Sessions model - for scheduled learning sessions
exports.sessions = (0, pg_core_1.pgTable)("sessions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    matchId: (0, pg_core_1.integer)("match_id").notNull().references(() => exports.matches.id),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    startTime: (0, pg_core_1.timestamp)("start_time").notNull(),
    endTime: (0, pg_core_1.timestamp)("end_time").notNull(),
    status: (0, pg_core_1.text)("status").notNull(), // 'scheduled', 'completed', 'cancelled'
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.insertSessionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.sessions).omit({
    id: true,
    createdAt: true,
});
// Quiz model - for skill verification
exports.quizzes = (0, pg_core_1.pgTable)("quizzes", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    skillId: (0, pg_core_1.integer)("skill_id").notNull().references(() => exports.skills.id),
    title: (0, pg_core_1.text)("title").notNull(),
    passingScore: (0, pg_core_1.integer)("passing_score").notNull(), // minimum score needed to pass
});
exports.insertQuizSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizzes).omit({
    id: true,
});
// Quiz questions
exports.quizQuestions = (0, pg_core_1.pgTable)("quiz_questions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    quizId: (0, pg_core_1.integer)("quiz_id").notNull().references(() => exports.quizzes.id),
    questionText: (0, pg_core_1.text)("question_text").notNull(),
    options: (0, pg_core_1.text)("options").array().notNull(), // Array of answer options
    correctAnswerIndex: (0, pg_core_1.integer)("correct_answer_index").notNull(),
});
exports.insertQuizQuestionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizQuestions).omit({
    id: true,
});
// Quiz attempts by users
exports.quizAttempts = (0, pg_core_1.pgTable)("quiz_attempts", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    quizId: (0, pg_core_1.integer)("quiz_id").notNull().references(() => exports.quizzes.id),
    score: (0, pg_core_1.integer)("score").notNull(),
    passed: (0, pg_core_1.boolean)("passed").notNull(),
    attemptedAt: (0, pg_core_1.timestamp)("attempted_at").defaultNow(),
});
exports.insertQuizAttemptSchema = (0, drizzle_zod_1.createInsertSchema)(exports.quizAttempts).omit({
    id: true,
    attemptedAt: true,
});
// Authentication schemas
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    username: zod_1.z.string().min(3).max(30),
    password: zod_1.z.string().min(6),
});

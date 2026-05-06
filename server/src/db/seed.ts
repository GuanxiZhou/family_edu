import { db } from "../lib/db.js";
import { children, families, goals, growthLogs, tasks } from "./schema.js";


const [family] = await db
  .insert(families)
  .values({ name: "示例家庭", timezone: "Asia/Shanghai" })
  .returning();

const [c1] = await db
  .insert(children)
  .values({
    familyId: family.familyId,
    name: "小明",
    grade: "小学五年级",
    school: "示例小学",
    subjectsJson: JSON.stringify(["数学", "语文", "英语"]),
    interestsJson: JSON.stringify(["钢琴", "游泳"]),
    parentNotes: "专注力需加强",
  })
  .returning();

const [c2] = await db
  .insert(children)
  .values({
    familyId: family.familyId,
    name: "小红",
    grade: "初中二年级",
    subjectsJson: JSON.stringify(["数学", "物理", "英语"]),
    interestsJson: JSON.stringify(["绘画"]),
  })
  .returning();

const [g1] = await db
  .insert(goals)
  .values({
    childId: c1.childId,
    title: "数学期末达到 90+",
    type: "学科",
    deadline: "2026-06-30",
    progress: 35,
  })
  .returning();

await db.insert(tasks).values([
  {
    childId: c1.childId,
    goalId: g1.goalId,
    title: "完成数学练习册 P12-15",
    dueDate: new Date().toISOString().slice(0, 10),
    source: "manual",
    status: "pending",
  },
  {
    childId: c1.childId,
    title: "英语单词复习 Unit 3",
    dueDate: new Date().toISOString().slice(0, 10),
    source: "manual",
    status: "pending",
  },
  {
    childId: c2.childId,
    title: "物理实验报告草稿",
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString().slice(0, 10),
    source: "manual",
    status: "overdue",
  },
]);

await db.insert(growthLogs).values([
  {
    childId: c1.childId,
    type: "score",
    subject: "数学",
    valueJson: JSON.stringify(82),
    content: "期中",
    loggedAt: "2026-03-15",
  },
  {
    childId: c1.childId,
    type: "score",
    subject: "数学",
    valueJson: JSON.stringify(68),
    content: "单元测",
    loggedAt: "2026-04-01",
  },
  {
    childId: c1.childId,
    type: "feedback",
    subject: "语文",
    content: "课堂发言积极",
    loggedAt: "2026-04-05",
  },
]);

console.log("Seed OK. familyId =", family.familyId);
process.exit(0);

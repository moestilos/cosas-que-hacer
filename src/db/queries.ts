import { and, asc, desc, eq, gte, isNull, isNotNull, lt, or, sql } from 'drizzle-orm';
import { db } from './index';
import { tasks, tags, type NewTask } from './schema';

export async function listTasks(userId: string, view: 'today' | 'upcoming' | 'all' | 'done' | 'tag', opts: { tagId?: string; search?: string; priority?: number } = {}) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
  const in7 = new Date(startOfDay.getTime() + 7 * 24 * 60 * 60 * 1000);

  const conds = [eq(tasks.userId, userId), isNull(tasks.parentId)];
  if (view === 'today') {
    conds.push(isNull(tasks.completedAt));
    conds.push(or(lt(tasks.dueDate, endOfDay), isNull(tasks.dueDate))!);
  } else if (view === 'upcoming') {
    conds.push(isNull(tasks.completedAt));
    conds.push(and(gte(tasks.dueDate, startOfDay), lt(tasks.dueDate, in7))!);
  } else if (view === 'done') {
    conds.push(isNotNull(tasks.completedAt));
  } else if (view === 'tag' && opts.tagId) {
    conds.push(eq(tasks.tagId, opts.tagId));
    conds.push(isNull(tasks.completedAt));
  } else if (view === 'all') {
    conds.push(isNull(tasks.completedAt));
  }
  if (opts.priority !== undefined) conds.push(eq(tasks.priority, opts.priority));
  if (opts.search) conds.push(sql`${tasks.title} ILIKE ${'%' + opts.search + '%'}`);

  const rows = await db.select().from(tasks).where(and(...conds)).orderBy(asc(tasks.position), desc(tasks.priority), asc(tasks.dueDate));
  return rows;
}

export async function listSubtasks(userId: string, parentId: string) {
  return db.select().from(tasks).where(and(eq(tasks.userId, userId), eq(tasks.parentId, parentId))).orderBy(asc(tasks.position));
}

export async function createTask(userId: string, input: Omit<NewTask, 'userId' | 'id'>) {
  const [row] = await db.insert(tasks).values({ ...input, userId }).returning();
  return row;
}

export async function updateTask(userId: string, id: string, patch: Partial<NewTask>) {
  const [row] = await db.update(tasks).set({ ...patch, updatedAt: new Date() }).where(and(eq(tasks.id, id), eq(tasks.userId, userId))).returning();
  return row;
}

export async function deleteTask(userId: string, id: string) {
  await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
}

export async function listTags(userId: string) {
  return db.select().from(tags).where(eq(tags.userId, userId)).orderBy(asc(tags.name));
}

export async function createTag(userId: string, name: string, color: string) {
  const [row] = await db.insert(tags).values({ userId, name, color }).returning();
  return row;
}

export async function deleteTag(userId: string, id: string) {
  await db.delete(tags).where(and(eq(tags.id, id), eq(tags.userId, userId)));
}

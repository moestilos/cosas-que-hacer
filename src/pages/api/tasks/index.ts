import type { APIRoute } from 'astro';
import { listTasks, createTask } from '@/db/queries';

export const GET: APIRoute = async ({ locals, url }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });
  const view = (url.searchParams.get('view') ?? 'today') as any;
  const tagId = url.searchParams.get('tagId') ?? undefined;
  const search = url.searchParams.get('q') ?? undefined;
  const priorityStr = url.searchParams.get('priority');
  const priority = priorityStr ? Number(priorityStr) : undefined;
  const rows = await listTasks(user.id, view, { tagId, search, priority });
  return Response.json(rows);
};

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });
  const body = await request.json();
  const row = await createTask(user.id, {
    title: body.title,
    notes: body.notes ?? null,
    dueDate: body.dueDate ? new Date(body.dueDate) : null,
    priority: body.priority ?? 1,
    tagId: body.tagId ?? null,
    parentId: body.parentId ?? null,
    position: body.position ?? 0,
  });
  return Response.json(row);
};

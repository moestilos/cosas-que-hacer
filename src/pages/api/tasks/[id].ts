import type { APIRoute } from 'astro';
import { updateTask, deleteTask } from '@/db/queries';

export const PATCH: APIRoute = async ({ locals, params, request }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });
  const id = params.id!;
  const body = await request.json();
  const patch: any = { ...body };
  if ('dueDate' in patch) patch.dueDate = patch.dueDate ? new Date(patch.dueDate) : null;
  if ('completedAt' in patch) patch.completedAt = patch.completedAt ? new Date(patch.completedAt) : null;
  const row = await updateTask(user.id, id, patch);
  return Response.json(row);
};

export const DELETE: APIRoute = async ({ locals, params }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });
  await deleteTask(user.id, params.id!);
  return new Response(null, { status: 204 });
};

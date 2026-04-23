import type { APIRoute } from 'astro';
import { deleteTag } from '@/db/queries';

export const DELETE: APIRoute = async ({ locals, params }) => {
  const user = locals.user;
  if (!user) return new Response('Unauthorized', { status: 401 });
  await deleteTag(user.id, params.id!);
  return new Response(null, { status: 204 });
};

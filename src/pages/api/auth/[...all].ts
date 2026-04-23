import type { APIRoute } from 'astro';
import { auth } from '@/lib/auth';

export const ALL: APIRoute = async ({ request }) => auth.handler(request);
export const GET = ALL;
export const POST = ALL;

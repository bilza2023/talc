
import { processes } from '$lib/processes/process.js';

export const POST = async ({ request }) => {
  const body = await request.json();
  const result = await processes.sort(body);
  return new Response(JSON.stringify(result), { status: 201 });
};

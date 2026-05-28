export async function onRequest(context: any) {
  const { request } = context;
  const url = new URL(request.url);
  url.hostname = 'club-points-system.vercel.app';

  const headers = new Headers(request.headers);
  headers.set('x-forwarded-host', request.headers.get('host') || '');

  const body = request.method !== 'GET' && request.method !== 'HEAD'
    ? request.body
    : undefined;

  const modifiedRequest = new Request(url.toString(), {
    method: request.method,
    headers,
    body,
    redirect: 'follow',
  });

  return fetch(modifiedRequest);
}

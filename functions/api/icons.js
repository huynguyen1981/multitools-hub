export function onRequest(context) {
  return Response.json({
    hello: "icons function works",
    method: context.request.method
  });
}

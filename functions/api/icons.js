export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  try {
    // GET: Lấy danh sách icon
    if (method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM icons ORDER BY created_at DESC").all();
      return Response.json(results || []);
    }

    // POST: Thêm icon mới
    if (method === "POST") {
      const body = await request.json();
      const { name, tags, svg_code } = body;
      const id = 'icon_' + Date.now();

      await env.DB.prepare(
        "INSERT INTO icons (id, name, tags, svg_code) VALUES (?, ?, ?, ?)"
      ).bind(id, name, tags || '', svg_code).run();

      return Response.json({ success: true, id });
    }

    // DELETE: Xóa icon
    if (method === "DELETE") {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      if (!id) return new Response("Missing id", { status: 400 });

      await env.DB.prepare("DELETE FROM icons WHERE id = ?").bind(id).run();
      return Response.json({ success: true });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

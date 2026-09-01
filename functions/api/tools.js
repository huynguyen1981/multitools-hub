export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  try {
    // GET: Lấy danh sách hoặc 1 tool cụ thể
    if (method === "GET") {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');

      if (id) {
        const tool = await env.DB.prepare("SELECT * FROM tools WHERE id = ?").bind(id).first();
        return Response.json(tool || {});
      }

      const { results } = await env.DB.prepare("SELECT id, title, desc, icon_svg FROM tools ORDER BY created_at DESC").all();
      return Response.json(results || []);
    }

    // POST: Tạo mới hoặc Cập nhật tool
    if (method === "POST") {
      const body = await request.json();
      const { id, title, desc, icon_svg, code_content } = body;

      if (id) {
        // Update
        await env.DB.prepare(
          "UPDATE tools SET title = ?, desc = ?, icon_svg = ?, code_content = ? WHERE id = ?"
        ).bind(title, desc, icon_svg, code_content, id).run();
        return Response.json({ success: true, id });
      } else {
        // Create
        const newId = 'tool_' + Date.now();
        await env.DB.prepare(
          "INSERT INTO tools (id, title, desc, icon_svg, code_content) VALUES (?, ?, ?, ?, ?)"
        ).bind(newId, title, desc || '', icon_svg || '', code_content || '').run();
        return Response.json({ success: true, id: newId });
      }
    }

    // DELETE: Xóa tool
    if (method === "DELETE") {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      if (!id) return new Response("Missing id", { status: 400 });

      await env.DB.prepare("DELETE FROM tools WHERE id = ?").bind(id).run();
      return Response.json({ success: true });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

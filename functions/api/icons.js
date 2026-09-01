export async function onRequest(context) {
  const { request, env } = context;

  try {
    if (request.method === "GET") {
      const { results } = await env.DB
        .prepare("SELECT * FROM icons ORDER BY created_at DESC")
        .all();

      return Response.json(results || []);
    }

    if (request.method === "POST") {
      const body = await request.json();

      const { name, tags, svg_code } = body;

      if (!name || !svg_code) {
        return Response.json(
          { error: "name và svg_code là bắt buộc" },
          { status: 400 }
        );
      }

      const id = "icon_" + Date.now();

      await env.DB
        .prepare(
          `INSERT INTO icons
           (id, name, tags, svg_code)
           VALUES (?, ?, ?, ?)`
        )
        .bind(
          id,
          name,
          tags || "",
          svg_code
        )
        .run();

      return Response.json({
        success: true,
        id
      });
    }

    if (request.method === "DELETE") {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return Response.json(
          { error: "Missing id" },
          { status: 400 }
        );
      }

      await env.DB
        .prepare("DELETE FROM icons WHERE id = ?")
        .bind(id)
        .run();

      return Response.json({
        success: true,
        id
      });
    }

    return Response.json(
      {
        error: "Method Not Allowed",
        method: request.method
      },
      { status: 405 }
    );

  } catch (err) {
    return Response.json(
      {
        error: err?.message || String(err)
      },
      { status: 500 }
    );
  }
}

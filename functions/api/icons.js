export async function onRequest(context) {
  const { request, env } = context;
  const method = request.method;

  // CORS
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Quan trọng: xử lý preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // GET: Lấy danh sách icon
    if (method === "GET") {
      const { results } = await env.DB
        .prepare("SELECT * FROM icons ORDER BY created_at DESC")
        .all();

      return Response.json(results || [], {
        headers: corsHeaders,
      });
    }

    // POST: Thêm icon mới
    if (method === "POST") {
      const body = await request.json();

      const { name, tags, svg_code } = body;

      if (!name || !svg_code) {
        return Response.json(
          {
            error: "name và svg_code là bắt buộc",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      const id = "icon_" + Date.now();

      await env.DB
        .prepare(
          "INSERT INTO icons (id, name, tags, svg_code) VALUES (?, ?, ?, ?)"
        )
        .bind(
          id,
          name,
          tags || "",
          svg_code
        )
        .run();

      return Response.json(
        {
          success: true,
          id,
        },
        {
          headers: corsHeaders,
        }
      );
    }

    // DELETE: Xóa icon
    if (method === "DELETE") {
      const url = new URL(request.url);
      const id = url.searchParams.get("id");

      if (!id) {
        return Response.json(
          {
            error: "Missing id",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      await env.DB
        .prepare("DELETE FROM icons WHERE id = ?")
        .bind(id)
        .run();

      return Response.json(
        {
          success: true,
          id,
        },
        {
          headers: corsHeaders,
        }
      );
    }

    return Response.json(
      {
        error: "Method Not Allowed",
        method,
      },
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  } catch (err) {
    return Response.json(
      {
        error: err?.message || String(err),
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

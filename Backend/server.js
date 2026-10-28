
const http = require("http");
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const PORT = 3000;
const dbPath = path.join(__dirname, "../database/sheamart.db");
const db = new DatabaseSync(dbPath);

const validStatuses = ["Pending", "Processing", "Shipped"];

function send(res, code, data) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
      if (Buffer.byteLength(body) > 10000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", reject);
  });
}

function validate(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "A JSON object is required";
  }

  if (!Number.isInteger(data.order_id) || data.order_id <= 0) {
    return "A valid positive order_id is required";
  }

  if (!validStatuses.includes(data.status)) {
    return "Status must be Pending, Processing or Shipped";
  }

  if (
    typeof data.remarks !== "string" ||
    data.remarks.trim().length === 0 ||
    data.remarks.length > 255
  ) {
    return "Remarks must contain 1 to 255 characters";
  }

  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (url.pathname === "/" && req.method === "GET") {
      return send(res, 200, {
        message: "SheaMart Backend is running successfully!"
      });
    }

    // READ
    if (url.pathname === "/api/order-status" && req.method === "GET") {
      const records = db.prepare(
        "SELECT * FROM order_status"
      ).all();

      return send(res, 200, records);
    }

    // CREATE
    if (url.pathname === "/api/order-status" && req.method === "POST") {
      const data = await readBody(req);
      const error = validate(data);

      if (error) return send(res, 400, { error });

      const order = db.prepare(
        "SELECT order_id FROM orders WHERE order_id = ?"
      ).get(data.order_id);

      if (!order) {
        return send(res, 400, { error: "Order does not exist" });
      }

      const result = db.prepare(`
        INSERT INTO order_status (order_id, status, updated_at, remarks)
        VALUES (?, ?, datetime('now'), ?)
      `).run(data.order_id, data.status, data.remarks.trim());

      return send(res, 201, {
        message: "Order status created successfully",
        status_id: Number(result.lastInsertRowid)
      });
    }

    const match = url.pathname.match(/^\/api\/order-status\/(\d+)$/);

    if (match) {
      const id = Number(match[1]);

      // UPDATE
      if (req.method === "PUT") {
        const data = await readBody(req);
        const error = validate(data);

        if (error) return send(res, 400, { error });

        const existing = db.prepare(
          "SELECT status_id FROM order_status WHERE status_id = ?"
        ).get(id);

        if (!existing) {
          return send(res, 404, { error: "Status record not found" });
        }

        const order = db.prepare(
          "SELECT order_id FROM orders WHERE order_id = ?"
        ).get(data.order_id);

        if (!order) {
          return send(res, 400, { error: "Order does not exist" });
        }

        db.prepare(`
          UPDATE order_status
          SET order_id = ?, status = ?, updated_at = datetime('now'), remarks = ?
          WHERE status_id = ?
        `).run(data.order_id, data.status, data.remarks.trim(), id);

        return send(res, 200, {
          message: "Order status updated successfully",
          status_id: id
        });
      }

      // DELETE
      if (req.method === "DELETE") {
        const result = db.prepare(
          "DELETE FROM order_status WHERE status_id = ?"
        ).run(id);

        if (result.changes === 0) {
          return send(res, 404, { error: "Status record not found" });
        }

        return send(res, 200, {
          message: "Order status deleted successfully",
          status_id: id
        });
      }
    }

    return send(res, 404, { error: "Not found" });

  } catch (error) {
    if (error.message === "Invalid JSON" ||
        error.message === "Request body too large") {
      return send(res, 400, { error: error.message });
    }

    console.error(error);
    return send(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

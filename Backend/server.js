const http = require("http");
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const PORT = 3000;

const dbPath = path.join(__dirname, "../database/sheamart.db");
const db = new DatabaseSync(dbPath, { readOnly: true });

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/") {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: "SheaMart Backend is running successfully!"
    }));
  } else if (req.url === "/api/order-status") {
    try {
      const statuses = db.prepare(
        "SELECT * FROM order_status"
      ).all();

      res.writeHead(200);
      res.end(JSON.stringify(statuses));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
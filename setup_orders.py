from pathlib import Path
import sqlite3

folder = Path(__file__).resolve().parent / "database"
db_path = folder / "sheamart.db"

if not db_path.exists():
	raise FileNotFoundError(f"Database not found: {db_path}")

with sqlite3.connect(db_path) as connection:
	connection.execute("PRAGMA foreign_keys = ON")

	tables = {
		row[0]
		for row in connection.execute(
			"SELECT name FROM sqlite_master WHERE type = 'table'"
		)
	}

	# Create and seed users/products if neither table exists.
	if not {"users", "products"} & tables:
		connection.executescript(
			(folder / "users_products.sql").read_text(encoding="utf-8")
		)
	elif not {"users", "products"} <= tables:
		raise RuntimeError(
			"Only one of users/products exists. Check the database first."
		)

	connection.executescript(
		(folder / "orders_order_items.sql").read_text(encoding="utf-8")
	)

	print("Orders:")
	for row in connection.execute("SELECT * FROM orders"):
		print(row)

	print("\nOrder items:")
	for row in connection.execute("SELECT * FROM order_item"):
		print(row)

	problems = connection.execute("PRAGMA foreign_key_check").fetchall()
	if problems:
		raise RuntimeError(f"Foreign key problems: {problems}")

	print("\nDatabase updated successfully!")

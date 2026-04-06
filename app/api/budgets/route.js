import { query, initTables } from '../../lib/db';

// GET /api/budgets
export async function GET() {
  try {
    await initTables();
    const rows = await query('SELECT * FROM budgets ORDER BY category');

    if (rows === null) {
      return Response.json({ fallback: true, message: 'Using localStorage' });
    }

    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/budgets — Create or update a budget
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, category, monthlyLimit } = body;

    await initTables();
    const result = await query(
      `INSERT INTO budgets (id, category, monthly_limit)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE monthly_limit = ?`,
      [id, category, monthlyLimit, monthlyLimit]
    );

    if (result === null) {
      return Response.json({ fallback: true, message: 'Using localStorage' });
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/budgets?category=X
export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get('category');

    if (!category) {
      return Response.json({ error: 'Category is required' }, { status: 400 });
    }

    await initTables();
    await query('DELETE FROM budgets WHERE category = ?', [category]);

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

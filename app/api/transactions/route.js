import { query, initTables } from '../../lib/db';

// GET /api/transactions — List all (with optional filters)
export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const month = searchParams.get('month'); // YYYY-MM format

  let sql = 'SELECT * FROM transactions WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  if (month) {
    sql += ' AND DATE_FORMAT(date, "%Y-%m") = ?';
    params.push(month);
  }

  sql += ' ORDER BY date DESC, created_at DESC';

  try {
    await initTables();
    const rows = await query(sql, params);

    if (rows === null) {
      return Response.json({ fallback: true, message: 'Using localStorage' });
    }

    return Response.json(rows);
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

// POST /api/transactions — Create a new transaction
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, type, amount, category, description, date } = body;

    await initTables();
    const result = await query(
      'INSERT INTO transactions (id, type, amount, category, description, date) VALUES (?, ?, ?, ?, ?, ?)',
      [id, type, amount, category, description || null, date]
    );

    if (result === null) {
      return Response.json({ fallback: true, message: 'Using localStorage' });
    }

    return Response.json({ success: true, id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

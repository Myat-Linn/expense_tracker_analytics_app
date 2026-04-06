import { query, initTables } from '../../lib/db';

// GET /api/stats — Return aggregated statistics
export async function GET() {
  try {
    await initTables();

    const incomeResult = await query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'income'"
    );
    const expenseResult = await query(
      "SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = 'expense'"
    );

    if (incomeResult === null || expenseResult === null) {
      return Response.json({ fallback: true, message: 'Using localStorage' });
    }

    const totalIncome = Number(incomeResult[0]?.total || 0);
    const totalExpenses = Number(expenseResult[0]?.total || 0);

    return Response.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

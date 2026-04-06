import { query, initTables } from '../../../lib/db';

// DELETE /api/transactions/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    await initTables();
    const result = await query('DELETE FROM transactions WHERE id = ?', [id]);

    if (result === null) {
      return Response.json({ fallback: true, message: 'Using localStorage' });
    }

    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

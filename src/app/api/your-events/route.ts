import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/src/lib/db';

export async function GET(req: NextRequest) {
  // Get userId from query params (in production, get from auth/session)
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  // Get all events created by this user
  const events = await query<any[]>(
    'SELECT * FROM events WHERE creator_id = ?',
    [userId]
  );

  // For each event, get all purchases
  const eventsWithPurchases = await Promise.all(
    events.map(async (event) => {
      const purchases = await query<any[]>(
        'SELECT * FROM purchases WHERE event_id = ?',
        [event.id]
      );
      return { ...event, purchases };
    })
  );

  return NextResponse.json(eventsWithPurchases);
}

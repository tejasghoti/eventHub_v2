import { NextRequest, NextResponse } from 'next/server';
import { getAllPurchases, createPurchase, Purchase, getPurchasesByEmail, getPurchasesByEventId } from '@/lib/models/purchase';
import { updateTicketAvailability } from '@/lib/models/event';
import { query } from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

// GET /api/purchases - Get all purchases
export async function GET(request: NextRequest) {
  try {
    // Optional: Filter by email or eventId if provided as query parameters
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const eventId = searchParams.get('eventId');
    
    let purchases;
    
    if (email) {
      // Filter by email
      purchases = await getPurchasesByEmail(email);
    } else if (eventId) {
      // Filter by event ID (for admin page)
      purchases = await getPurchasesByEventId(Number(eventId));
    } else {
      // Get all purchases
      purchases = await getAllPurchases();
    }
    
    return NextResponse.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

// POST /api/purchases - Create a new purchase
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Check if the event is in the past
    const eventId = data.eventId;
    const checkEventQuery = `
      SELECT * FROM events 
      WHERE id = ? AND CONCAT(date, ' ', time) >= NOW()
    `;
    
    const eventResult = await query<RowDataPacket[]>(checkEventQuery, [eventId]);
    
    // If no event found or event is in the past, return an error
    if (!eventResult.length) {
      return NextResponse.json(
        { error: 'Cannot register for past events' },
        { status: 400 }
      );
    }
    
    // Prepare the purchase data
    const purchaseData: Purchase = {
      event_id: data.eventId,
      amount: data.amount,
      status: data.status || 'Completed',
      attendee_name: data.attendeeInfo.name,
      attendee_email: data.attendeeInfo.email,
      attendee_phone: data.attendeeInfo.phone || '',
      payment_method: data.paymentMethod
    };
    
    // Create the purchase
    const newPurchase = await createPurchase(purchaseData);
    
    // Update ticket availability for the event
    await updateTicketAvailability(data.eventId);
    
    return NextResponse.json(newPurchase, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase' },
      { status: 500 }
    );
  }
}

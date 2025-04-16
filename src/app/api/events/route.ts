import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent, Event } from '@/lib/models/event';

// GET /api/events - Get all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filterParam = searchParams.get('filter');
    const filter = filterParam === 'upcoming' || filterParam === 'past' 
      ? filterParam 
      : undefined;
    
    const events = await getAllEvents(filter);
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Prepare the event data
    const eventData: Event = {
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      venue: data.venue,
      category: data.category,
      total_tickets: data.tickets.total,
      available_tickets: data.tickets.total, // Initially, all tickets are available
      ticket_price: data.tickets.price
    };
    
    const newEvent = await createEvent(eventData);
    
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

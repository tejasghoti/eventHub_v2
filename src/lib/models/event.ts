import { query } from '../db';
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2/promise';

export interface Event {
  id?: number;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  total_tickets: number;
  available_tickets: number;
  ticket_price: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventRow extends Event, RowDataPacket {}

// Get all events
export async function getAllEvents(filter?: 'upcoming' | 'past'): Promise<EventRow[]> {
  let queryStr = 'SELECT * FROM events';
  let params: any[] = [];

  if (filter === 'upcoming') {
    queryStr += ' WHERE CONCAT(date, " ", time) >= NOW()';
  } else if (filter === 'past') {
    queryStr += ' WHERE CONCAT(date, " ", time) < NOW()';
  }

  queryStr += ' ORDER BY date ASC';

  if (filter === 'past') {
    queryStr = queryStr.replace('ASC', 'DESC');
  }

  return await query<EventRow[]>(queryStr, params);
}

// Get event by ID
export async function getEventById(id: number): Promise<EventRow | null> {
  const events = await query<EventRow[]>(
    'SELECT * FROM events WHERE id = ?',
    [id]
  );
  return events.length > 0 ? events[0] : null;
}

// Create a new event
export async function createEvent(event: Event): Promise<Event & { id: number }> {
  const result = await query<ResultSetHeader>(
    `INSERT INTO events 
    (title, description, date, time, venue, category, total_tickets, available_tickets, ticket_price) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.title,
      event.description,
      event.date,
      event.time,
      event.venue,
      event.category,
      event.total_tickets,
      event.available_tickets,
      event.ticket_price
    ]
  );
  
  return { id: result.insertId, ...event };
}

// Update an event
export async function updateEvent(id: number, event: Partial<Event>): Promise<EventRow | null> {
  const fields = Object.keys(event)
    .map(key => `${key} = ?`)
    .join(', ');
  
  const values = Object.values(event);
  
  await query<OkPacket>(
    `UPDATE events SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [...values, id]
  );
  
  return getEventById(id);
}

// Update ticket availability
export async function updateTicketAvailability(id: number, ticketsToReduce: number = 1): Promise<EventRow | null> {
  await query<OkPacket>(
    'UPDATE events SET available_tickets = available_tickets - ? WHERE id = ? AND available_tickets >= ?',
    [ticketsToReduce, id, ticketsToReduce]
  );
  
  return getEventById(id);
}

// Delete an event
export async function deleteEvent(id: number): Promise<{ id: number }> {
  await query<OkPacket>('DELETE FROM events WHERE id = ?', [id]);
  return { id };
}

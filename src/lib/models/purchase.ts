import { query } from '../db';
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2/promise';

export interface Purchase {
  id?: number;
  event_id: number;
  event_title?: string;
  purchase_date?: string;
  amount: number;
  status: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  payment_method: string;
  created_at?: string;
  updated_at?: string;
}

export interface PurchaseRow extends Purchase, RowDataPacket {}

// Get all purchases
export async function getAllPurchases(): Promise<PurchaseRow[]> {
  return await query<PurchaseRow[]>(`
    SELECT p.*, e.title as event_title 
    FROM purchases p
    JOIN events e ON p.event_id = e.id
    ORDER BY p.created_at DESC
  `);
}

// Get purchases by user email
export async function getPurchasesByEmail(email: string): Promise<PurchaseRow[]> {
  return await query<PurchaseRow[]>(`
    SELECT p.*, e.title as event_title 
    FROM purchases p
    JOIN events e ON p.event_id = e.id
    WHERE p.attendee_email = ?
    ORDER BY p.created_at DESC
  `, [email]);
}

// Get purchases by event ID (for admin page)
export async function getPurchasesByEventId(eventId: number): Promise<PurchaseRow[]> {
  return await query<PurchaseRow[]>(`
    SELECT p.*, e.title as event_title 
    FROM purchases p
    JOIN events e ON p.event_id = e.id
    WHERE p.event_id = ?
    ORDER BY p.created_at DESC
  `, [eventId]);
}

// Get purchase by ID
export async function getPurchaseById(id: number): Promise<PurchaseRow | null> {
  const purchases = await query<PurchaseRow[]>(`
    SELECT p.*, e.title as event_title 
    FROM purchases p
    JOIN events e ON p.event_id = e.id
    WHERE p.id = ?
  `, [id]);
  
  return purchases.length > 0 ? purchases[0] : null;
}

// Create a new purchase
export async function createPurchase(purchase: Purchase): Promise<Purchase & { id: number }> {
  const result = await query<ResultSetHeader>(
    `INSERT INTO purchases 
    (event_id, amount, status, attendee_name, attendee_email, attendee_phone, payment_method) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      purchase.event_id,
      purchase.amount,
      purchase.status || 'Completed',
      purchase.attendee_name,
      purchase.attendee_email,
      purchase.attendee_phone,
      purchase.payment_method
    ]
  );
  
  return { id: result.insertId, ...purchase };
}

// Update a purchase
export async function updatePurchase(id: number, purchase: Partial<Purchase>): Promise<PurchaseRow | null> {
  const fields = Object.keys(purchase)
    .map(key => `${key} = ?`)
    .join(', ');
  
  const values = Object.values(purchase);
  
  await query<OkPacket>(
    `UPDATE purchases SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [...values, id]
  );
  
  return getPurchaseById(id);
}

// Delete a purchase
export async function deletePurchase(id: number): Promise<{ id: number }> {
  await query<OkPacket>('DELETE FROM purchases WHERE id = ?', [id]);
  return { id };
}

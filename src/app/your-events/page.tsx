import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: string;
  total_tickets: number;
  available_tickets: number;
  ticket_price: number;
}

interface Purchase {
  id: number;
  event_id: number;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  status: string;
  payment_method: string;
  amount: number;
}

interface EventWithPurchases extends Event {
  purchases: Purchase[];
}

const YourEventsPage = () => {
  const [events, setEvents] = useState<EventWithPurchases[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Replace the userId with the actual logged-in user's ID from auth/session
    const userId = 1;
    axios.get(`/api/your-events?userId=${userId}`)
      .then(res => {
        setEvents(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load events.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Your Events & Registered Users</h1>
      {events.length === 0 ? (
        <p>You have not created any events yet.</p>
      ) : (
        events.map(event => (
          <div key={event.id} className="mb-8 border rounded-lg p-4 shadow">
            <h2 className="text-xl font-semibold">{event.title}</h2>
            <p className="text-gray-600">{event.description}</p>
            <p className="text-sm">{event.date} {event.time} | {event.venue} | Category: {event.category}</p>
            <p className="text-sm">Ticket Price: ₹{Number(event.ticket_price).toFixed(2)}</p>
            <h3 className="mt-4 font-semibold">Registered Users:</h3>
            {event.purchases.length === 0 ? (
              <p className="text-gray-500">No one has registered yet.</p>
            ) : (
              <table className="min-w-full text-left mt-2 border">
                <thead>
                  <tr>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Email</th>
                    <th className="border px-2 py-1">Phone</th>
                    <th className="border px-2 py-1">Status</th>
                    <th className="border px-2 py-1">Payment</th>
                    <th className="border px-2 py-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {event.purchases.map(purchase => (
                    <tr key={purchase.id}>
                      <td className="border px-2 py-1">{purchase.attendee_name}</td>
                      <td className="border px-2 py-1">{purchase.attendee_email}</td>
                      <td className="border px-2 py-1">{purchase.attendee_phone}</td>
                      <td className="border px-2 py-1">{purchase.status}</td>
                      <td className="border px-2 py-1">{purchase.payment_method}</td>
                      <td className="border px-2 py-1">₹{Number(purchase.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default YourEventsPage;

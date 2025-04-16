"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useRouter } from 'next/navigation'

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
  event_title: string;
  purchase_date: string;
  amount: number;
  status: string;
  attendee_name: string;
  attendee_email: string;
  attendee_phone: string;
  payment_method: string;
}

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch registrations when an event is selected
  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!selectedEvent) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/purchases?eventId=${selectedEvent.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch registrations');
        }
        const data = await response.json();
        setRegistrations(data);
      } catch (error) {
        console.error('Error fetching registrations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegistrations();
  }, [selectedEvent]);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleBackToEvents = () => {
    setSelectedEvent(null);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleBackToHome} variant="outline">
          Back to Home
        </Button>
      </div>

      {selectedEvent ? (
        <div>
          <Button 
            onClick={handleBackToEvents} 
            variant="outline" 
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
          </Button>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{selectedEvent.title}</CardTitle>
              <CardDescription>
                {formatDate(selectedEvent.date)} at {selectedEvent.time} | {selectedEvent.venue}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <p className="font-semibold">Category</p>
                  <p>{selectedEvent.category}</p>
                </div>
                <div>
                  <p className="font-semibold">Total Tickets</p>
                  <p>{selectedEvent.total_tickets}</p>
                </div>
                <div>
                  <p className="font-semibold">Available Tickets</p>
                  <p>{selectedEvent.available_tickets}</p>
                </div>
              </div>
              <p className="font-semibold">Description</p>
              <p>{selectedEvent.description}</p>
            </CardContent>
          </Card>

          <h2 className="text-2xl font-bold mb-4">Registrations ({registrations.length})</h2>
          
          {isLoading ? (
            <p>Loading registrations...</p>
          ) : registrations.length === 0 ? (
            <p>No registrations found for this event.</p>
          ) : (
            <div className="grid gap-4">
              {registrations.map((registration) => (
                <Card key={registration.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{registration.attendee_name}</CardTitle>
                    <CardDescription>{registration.attendee_email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-semibold">Registration Date</p>
                        <p>{formatDate(registration.purchase_date)}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Phone</p>
                        <p>{registration.attendee_phone || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Payment Method</p>
                        <p>{registration.payment_method}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Amount</p>
                        <p>₹{Number(registration.amount).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="font-semibold">Status</p>
                        <p>{registration.status}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Select an Event</h2>
          
          {isLoading ? (
            <p>Loading events...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card 
                  key={event.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleEventSelect(event)}
                >
                  <CardHeader>
                    <CardTitle>{event.title}</CardTitle>
                    <CardDescription>
                      {formatDate(event.date)} | {event.venue}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-2">{event.description}</p>
                  </CardContent>
                  <CardFooter>
                    <div className="w-full flex justify-between items-center">
                      <span className="text-sm">
                        {event.total_tickets - event.available_tickets} / {event.total_tickets} registered
                      </span>
                      <Button variant="outline" size="sm">View Registrations</Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

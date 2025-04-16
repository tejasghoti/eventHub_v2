"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Home, User, Calendar, Clock, ArrowRight, Plus, ArrowLeft } from "lucide-react"

export default function EventManagementApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [currentView, setCurrentView] = useState('events') // 'events', 'event-detail', 'purchases', 'register', 'create-event'
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [purchases, setPurchases] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [eventFilter, setEventFilter] = useState<'upcoming' | 'past' | null>('upcoming')
  
  // Registration form state
  const [registrationInfo, setRegistrationInfo] = useState({
    name: '',
    email: '',
    phone: '',
    paymentMethod: 'credit'
  })
  
  // Create event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    category: 'Technology',
    tickets: {
      total: 0,
      price: 0
    }
  })

  // Fetch events from the API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const url = eventFilter 
          ? `/api/events?filter=${eventFilter}` 
          : '/api/events';
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }
        const data = await response.json();
        
        // Transform data to match the expected format
        const formattedEvents = data.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          venue: event.venue,
          category: event.category,
          tickets: {
            available: event.available_tickets,
            total: event.total_tickets,
            price: event.ticket_price
          }
        }));
        
        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [eventFilter]);

  // Fetch purchases when logged in
  useEffect(() => {
    const fetchPurchases = async () => {
      if (!isLoggedIn || !email) return;
      
      try {
        const response = await fetch(`/api/purchases?email=${encodeURIComponent(email)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch purchases');
        }
        const data = await response.json();
        
        // Transform data to match the expected format
        const formattedPurchases = data.map((purchase: any) => ({
          id: purchase.id,
          eventId: purchase.event_id,
          eventTitle: purchase.event_title,
          purchaseDate: new Date(purchase.purchase_date).toISOString().split('T')[0],
          amount: purchase.amount,
          status: purchase.status,
          attendeeInfo: {
            name: purchase.attendee_name,
            email: purchase.attendee_email,
            phone: purchase.attendee_phone
          }
        }));
        
        setPurchases(formattedPurchases);
      } catch (error) {
        console.error('Error fetching purchases:', error);
      }
    };

    fetchPurchases();
  }, [isLoggedIn, email]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      setIsLoggedIn(true)
      setCurrentView('events')
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setEmail('')
    setPassword('')
    setCurrentView('events')
  }

  const viewEventDetails = (event: any) => {
    setSelectedEvent(event)
    setCurrentView('event-detail')
  }

  const startRegistration = () => {
    setCurrentView('register')
  }

  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setRegistrationInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setRegistrationInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const completeRegistration = async () => {
    if (!selectedEvent || !registrationInfo.name || !registrationInfo.email) return;
    
    try {
      // Create purchase via API
      const purchaseData = {
        eventId: selectedEvent.id,
        amount: selectedEvent.tickets.price,
        status: "Completed",
        attendeeInfo: {
          name: registrationInfo.name,
          email: registrationInfo.email,
          phone: registrationInfo.phone
        },
        paymentMethod: registrationInfo.paymentMethod
      };
      
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to complete registration');
      }
      
      const newPurchase = await response.json();
      
      // Format the purchase to match our expected structure
      const formattedPurchase = {
        id: newPurchase.id,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        purchaseDate: new Date().toISOString().split('T')[0],
        amount: selectedEvent.tickets.price,
        status: "Completed",
        attendeeInfo: {
          name: registrationInfo.name,
          email: registrationInfo.email,
          phone: registrationInfo.phone
        }
      };
      
      // Add to local state
      setPurchases([...purchases, formattedPurchase]);
      
      // Refresh events to get updated ticket availability
      const eventsResponse = await fetch('/api/events');
      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        
        // Transform data to match the expected format
        const formattedEvents = eventsData.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          venue: event.venue,
          category: event.category,
          tickets: {
            available: event.available_tickets,
            total: event.total_tickets,
            price: event.ticket_price
          }
        }));
        
        setEvents(formattedEvents);
        
        // Update selected event with new ticket availability
        const updatedEvent = formattedEvents.find((e: any) => e.id === selectedEvent.id);
        if (updatedEvent) {
          setSelectedEvent(updatedEvent);
        }
      }
      
      setCurrentView('purchases');
      setRegistrationInfo({ name: '', email: '', phone: '', paymentMethod: 'credit' });
    } catch (error) {
      console.error('Error completing registration:', error);
      alert('Failed to complete registration. Please try again.');
    }
  }

  const handleNewEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name.startsWith('tickets.')) {
      const ticketField = name.split('.')[1]
      setNewEvent(prev => ({
        ...prev,
        tickets: {
          ...prev.tickets,
          [ticketField]: ticketField === 'price' ? parseFloat(value) : parseInt(value)
        }
      }))
    } else {
      setNewEvent(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleNewEventCategoryChange = (value: string) => {
    setNewEvent(prev => ({
      ...prev,
      category: value
    }));
  };

  const handleNewEventSelectChange = (name: string, value: string) => {
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  }

  const createNewEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.venue || newEvent.tickets.total <= 0) return;
    
    try {
      // Create event via API
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      
      const createdEvent = await response.json();
      
      // Format the event to match our expected structure
      const formattedEvent = {
        id: createdEvent.id,
        title: createdEvent.title,
        description: createdEvent.description,
        date: createdEvent.date,
        time: createdEvent.time,
        venue: createdEvent.venue,
        category: createdEvent.category,
        tickets: {
          available: createdEvent.available_tickets,
          total: createdEvent.total_tickets,
          price: createdEvent.ticket_price
        }
      };
      
      // Add to local state
      setEvents([...events, formattedEvent]);
      
      // Reset form
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        category: 'Technology',
        tickets: {
          total: 0,
          price: 0
        }
      });
      
      setCurrentView('events');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    }
  }

  const renderEventsView = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Event Hub</h1>
          <div className="flex gap-2">
            {isLoggedIn ? (
              <>
                <Button onClick={() => setCurrentView('purchases')} variant="outline">My Tickets</Button>
                <Button onClick={handleLogout}>Logout</Button>
                <Button onClick={() => window.location.href = '/admin'} variant="outline">Admin</Button>
              </>
            ) : (
              <Button onClick={() => setCurrentView('login')}>Login</Button>
            )}
          </div>
        </div>
        
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            <Button 
              onClick={() => setEventFilter('upcoming')} 
              variant={eventFilter === 'upcoming' ? 'default' : 'outline'}
            >
              Upcoming Events
            </Button>
            <Button 
              onClick={() => setEventFilter('past')} 
              variant={eventFilter === 'past' ? 'default' : 'outline'}
            >
              Past Events
            </Button>
            <Button 
              onClick={() => setEventFilter(null)} 
              variant={eventFilter === null ? 'default' : 'outline'}
            >
              All Events
            </Button>
          </div>
          
          {isLoggedIn && (
            <Button onClick={() => setCurrentView('create-event')}>
              <Plus className="mr-2 h-4 w-4" /> Create Event
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">No events found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => (
              <Card key={event.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-xl">{event.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      <Clock className="h-4 w-4 ml-3 mr-1" />
                      <span>{event.time}</span>
                    </div>
                    <div className="mt-1">{event.venue}</div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="line-clamp-3">{event.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                  <div>
                    <p className="text-sm font-medium">₹{Number(event.tickets.price).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{event.tickets.available} tickets left</p>
                  </div>
                  <Button 
                    onClick={() => viewEventDetails(event)} 
                    variant="outline" 
                    size="sm"
                  >
                    View Details <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderEventDetailView = () => {
    if (!selectedEvent) return null
    
    const isPastEvent = new Date(`${selectedEvent.date} ${selectedEvent.time}`).getTime() < Date.now();
    
    return (
      <div>
        <Button onClick={() => setCurrentView('events')} variant="outline" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{selectedEvent.title}</CardTitle>
            <CardDescription>
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(selectedEvent.date).toLocaleDateString()}</span>
                <Clock className="h-4 w-4 ml-3 mr-1" />
                <span>{selectedEvent.time}</span>
              </div>
              <div className="mt-1">{selectedEvent.venue}</div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{selectedEvent.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Category</p>
                <p>{selectedEvent.category}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Price</p>
                <p>₹{Number(selectedEvent.tickets.price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Available Tickets</p>
                <p>{selectedEvent.tickets.available} of {selectedEvent.tickets.total}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            {selectedEvent.tickets.available > 0 && !isPastEvent ? (
              <Button onClick={startRegistration} className="w-full">
                Register Now
              </Button>
            ) : isPastEvent ? (
              <Button disabled className="w-full">
                Registration Closed (Past Event)
              </Button>
            ) : (
              <Button disabled className="w-full">
                Sold Out
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">EventHub</span>
            </div>
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{email}</span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'login' ? (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="you@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Login</Button>
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => setCurrentView('events')}
                >
                  Cancel
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <>
            {currentView === 'events' && renderEventsView()}
            {currentView === 'event-detail' && renderEventDetailView()}
            {currentView === 'register' && selectedEvent && (
              <div className="max-w-2xl mx-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentView('event-detail')}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Event Details
                </Button>
                <Card>
                  <CardHeader>
                    <CardTitle>Register for {selectedEvent.title}</CardTitle>
                    <CardDescription>
                      {new Date(selectedEvent.date).toLocaleDateString()} at {selectedEvent.time}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input 
                          id="name" 
                          name="name"
                          placeholder="John Doe" 
                          value={registrationInfo.name}
                          onChange={handleRegistrationChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email"
                          type="email" 
                          placeholder="you@example.com" 
                          value={registrationInfo.email}
                          onChange={handleRegistrationChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone" 
                          name="phone"
                          placeholder="123-456-7890" 
                          value={registrationInfo.phone}
                          onChange={handleRegistrationChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod">Payment Method</Label>
                        <Select 
                          value={registrationInfo.paymentMethod} 
                          onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="credit">Credit Card</SelectItem>
                            <SelectItem value="debit">Debit Card</SelectItem>
                            <SelectItem value="upi">UPI</SelectItem>
                            <SelectItem value="netbanking">Net Banking</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="pt-4 border-t">
                        <div className="flex justify-between">
                          <span>Ticket Price</span>
                          <span className="font-bold">₹{Number(selectedEvent.tickets.price).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={completeRegistration}
                      className="w-full"
                      disabled={!registrationInfo.name || !registrationInfo.email}
                    >
                      Complete Registration
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
            {currentView === 'purchases' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">My Tickets</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setCurrentView('events')}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Events
                  </Button>
                </div>
                
                {purchases.length > 0 ? (
                  <div className="grid gap-4">
                    {purchases.map((purchase) => (
                      <Card key={purchase.id}>
                        <CardHeader>
                          <CardTitle>{purchase.eventTitle}</CardTitle>
                          <CardDescription>
                            Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Attendee</p>
                              <p>{purchase.attendeeInfo.name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Email</p>
                              <p>{purchase.attendeeInfo.email}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Amount</p>
                              <p>₹{purchase.amount}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Status</p>
                              <p>{purchase.status}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">You haven't purchased any tickets yet.</p>
                    <Button 
                      onClick={() => setCurrentView('events')}
                      className="mt-4"
                    >
                      Browse Events
                    </Button>
                  </div>
                )}
              </div>
            )}
            {currentView === 'create-event' && (
              <div className="max-w-3xl mx-auto">
                <Button 
                  variant="ghost" 
                  onClick={() => setCurrentView('events')}
                  className="mb-4"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
                <Card>
                  <CardHeader>
                    <CardTitle>Create New Event</CardTitle>
                    <CardDescription>Fill in the details to create a new event</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input 
                          id="title" 
                          name="title"
                          placeholder="Tech Conference 2025" 
                          value={newEvent.title}
                          onChange={handleNewEventChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description" 
                          name="description"
                          placeholder="Event description..." 
                          value={newEvent.description}
                          onChange={handleNewEventChange}
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input 
                            id="date" 
                            name="date"
                            type="date" 
                            value={newEvent.date}
                            onChange={handleNewEventChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time">Time</Label>
                          <Input 
                            id="time" 
                            name="time"
                            type="time" 
                            value={newEvent.time}
                            onChange={handleNewEventChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="venue">Venue</Label>
                        <Input 
                          id="venue" 
                          name="venue"
                          placeholder="Convention Center" 
                          value={newEvent.venue}
                          onChange={handleNewEventChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={newEvent.category} 
                          onValueChange={handleNewEventCategoryChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Technology">Technology</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Entertainment">Entertainment</SelectItem>
                            <SelectItem value="Sports">Sports</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="tickets.total">Total Tickets</Label>
                          <Input 
                            id="tickets.total" 
                            name="tickets.total"
                            type="number" 
                            placeholder="100" 
                            value={newEvent.tickets.total === 0 ? '' : newEvent.tickets.total}
                            onChange={handleNewEventChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tickets.price">Ticket Price (₹)</Label>
                          <Input 
                            id="tickets.price" 
                            name="tickets.price"
                            type="number" 
                            step="0.01" 
                            placeholder="99.99" 
                            value={newEvent.tickets.price === 0 ? '' : newEvent.tickets.price}
                            onChange={handleNewEventChange}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={createNewEvent}
                      className="w-full"
                      disabled={!newEvent.title || !newEvent.date || !newEvent.venue || newEvent.tickets.total <= 0}
                    >
                      Create Event
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 EventHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

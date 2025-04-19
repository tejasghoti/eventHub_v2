import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>EventHub - Your Event Management Solution</title>
        <meta name="description" content="EventHub - Manage your events with ease" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to EventHub
        </h1>
        
        <p className="text-xl text-center mb-4">
          Your comprehensive event management platform
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Create Events</h2>
            <p>Easily create and manage your events with our intuitive interface.</p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Manage Registrations</h2>
            <p>Track and manage event registrations in real-time.</p>
          </div>
          
          <div className="p-6 border rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-2">Analytics</h2>
            <p>Get insights into your event performance with detailed analytics.</p>
          </div>
        </div>
      </main>

      <footer className="mt-8 text-center">
        <p>© {new Date().getFullYear()} EventHub. All rights reserved.</p>
      </footer>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import EventDetailAdmin from './components/EventDetailAdmin';
import GuestEventView from './components/GuestEventView';
import AuthModal from './components/AuthModal';
import CreateEventModal from './components/CreateEventModal';

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('fiesta_rsvp_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('fiesta_rsvp_token') || null;
  });

  const [currentView, setCurrentView] = useState('home'); // 'home' | 'dashboard' | 'eventDetail' | 'guest'
  const [activeEventCode, setActiveEventCode] = useState('');
  
  // Modals
  const [authModal, setAuthModal] = useState({ open: false, mode: 'login' });
  const [createEventOpen, setCreateEventOpen] = useState(false);

  // Sync with URL pathname
  useEffect(() => {
    function parseRoute() {
      const path = window.location.pathname;
      if (path.startsWith('/e/')) {
        const code = path.substring(3).trim();
        if (code) {
          setActiveEventCode(code.toUpperCase());
          setCurrentView('guest');
          return;
        }
      }

      if (path === '/dashboard') {
        if (token) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('home');
          setAuthModal({ open: true, mode: 'login' });
        }
        return;
      }

      setCurrentView('home');
    }

    parseRoute();
    window.addEventListener('popstate', parseRoute);
    return () => window.removeEventListener('popstate', parseRoute);
  }, [token]);

  function navigateTo(view, code = '') {
    setCurrentView(view);
    setActiveEventCode(code);

    if (view === 'guest' && code) {
      window.history.pushState({}, '', `/e/${code}`);
    } else if (view === 'dashboard') {
      window.history.pushState({}, '', '/dashboard');
    } else if (view === 'home') {
      window.history.pushState({}, '', '/');
    }
  }

  function handleLoginSuccess(newToken, newUser) {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('fiesta_rsvp_token', newToken);
    localStorage.setItem('fiesta_rsvp_user', JSON.stringify(newUser));
    navigateTo('dashboard');
  }

  function handleLogout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('fiesta_rsvp_token');
    localStorage.removeItem('fiesta_rsvp_user');
    navigateTo('home');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Hide standard navbar on guest page for pure immersion, or show if needed */}
      {currentView !== 'guest' && (
        <Navbar
          user={user}
          onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
          onLogout={handleLogout}
          onNavigateHome={() => navigateTo('home')}
          onNavigateDashboard={() => {
            if (user) navigateTo('dashboard');
            else setAuthModal({ open: true, mode: 'login' });
          }}
          onOpenCreateEvent={() => {
            if (user) setCreateEventOpen(true);
            else setAuthModal({ open: true, mode: 'login' });
          }}
          onSearchCode={(code) => navigateTo('guest', code)}
        />
      )}

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'guest' && activeEventCode && (
          <GuestEventView
            eventCode={activeEventCode}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {currentView === 'home' && (
          <Home
            user={user}
            onOpenAuth={(mode) => setAuthModal({ open: true, mode })}
            onOpenCreateEvent={() => {
              if (user) setCreateEventOpen(true);
              else setAuthModal({ open: true, mode: 'login' });
            }}
            onNavigateGuest={(code) => navigateTo('guest', code)}
          />
        )}

        {currentView === 'dashboard' && token && (
          <Dashboard
            token={token}
            onSelectEvent={(code) => {
              setActiveEventCode(code);
              setCurrentView('eventDetail');
            }}
            onOpenCreateEvent={() => setCreateEventOpen(true)}
            onNavigateGuest={(code) => navigateTo('guest', code)}
          />
        )}

        {currentView === 'eventDetail' && activeEventCode && token && (
          <EventDetailAdmin
            eventCode={activeEventCode}
            token={token}
            onBack={() => navigateTo('dashboard')}
            onNavigateGuest={(code) => navigateTo('guest', code)}
          />
        )}
      </main>

      {/* Auth Modal */}
      {authModal.open && (
        <AuthModal
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ open: false, mode: 'login' })}
          onSuccess={handleLoginSuccess}
        />
      )}

      {/* Create Event Modal */}
      {createEventOpen && token && (
        <CreateEventModal
          token={token}
          onClose={() => setCreateEventOpen(false)}
          onCreated={(newEvent) => {
            setActiveEventCode(newEvent.code);
            setCurrentView('eventDetail');
          }}
        />
      )}

    </div>
  );
}

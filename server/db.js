import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DEFAULT_STORE = {
  users: [],
  events: [],
  rsvps: []
};

// Helper for atomic file reading and writing
function readStore() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
      return DEFAULT_STORE;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading store:', err);
    return DEFAULT_STORE;
  }
}

function writeStore(data) {
  const tempFile = `${DB_FILE}.${crypto.randomBytes(4).toString('hex')}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

// Generate unique readable event code, e.g. "FIESTA-7K9M"
export function generateEventCode(existingCodes = []) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing 0/O, 1/I
  let code = '';
  let tries = 0;
  do {
    let suffix = '';
    for (let i = 0; i < 4; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    code = `FIESTA-${suffix}`;
    tries++;
  } while (existingCodes.includes(code) && tries < 100);

  return code;
}

// Format date to human friendly Spanish string
export function formatSpanishDate(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'full',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return isoString;
  }
}

// Check if a deadline has passed
export function isDeadlinePassed(deadlineDate) {
  if (!deadlineDate) return false;
  const deadline = new Date(deadlineDate);
  if (isNaN(deadline.getTime())) return false;
  return Date.now() > deadline.getTime();
}

// --- USER OPERATIONS ---
export function findUserByEmail(email) {
  const db = readStore();
  const normalized = email.trim().toLowerCase();
  return db.users.find(u => u.email.toLowerCase() === normalized);
}

export function findUserById(id) {
  const db = readStore();
  return db.users.find(u => u.id === id);
}

export function createUser({ name, email, passwordHash, salt }) {
  const db = readStore();
  const normalizedEmail = email.trim().toLowerCase();
  
  if (db.users.some(u => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
  }

  const newUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeStore(db);
  return newUser;
}

// --- EVENT OPERATIONS ---
export function getEventsByUserId(userId) {
  const db = readStore();
  const userEvents = db.events.filter(e => e.userId === userId);

  return userEvents.map(event => {
    const eventRsvps = db.rsvps.filter(r => r.eventCode === event.code);
    const totalRsvps = eventRsvps.length; // Titulares
    const totalGuests = eventRsvps.reduce((sum, r) => sum + (r.totalSeats || 1), 0); // Titulares + acompañantes
    const closed = isDeadlinePassed(event.deadlineDate);

    return {
      ...event,
      totalRsvps,
      totalGuests,
      isClosed: closed,
      deadlineFormatted: formatSpanishDate(event.deadlineDate),
      eventDateFormatted: formatSpanishDate(event.eventDate)
    };
  });
}

export function getEventByCode(code) {
  const db = readStore();
  return db.events.find(e => e.code.toUpperCase() === code.toUpperCase());
}

export function createEvent({ userId, title, theme, description, eventDate, deadlineDate, location, address, mapUrl }) {
  const db = readStore();
  const existingCodes = db.events.map(e => e.code);
  const code = generateEventCode(existingCodes);

  const newEvent = {
    id: crypto.randomUUID(),
    code,
    userId,
    title: title.trim(),
    theme: theme || 'cumpleanos',
    description: description ? description.trim() : '',
    eventDate: eventDate || '',
    deadlineDate: deadlineDate || '',
    location: location ? location.trim() : '',
    address: address ? address.trim() : '',
    mapUrl: mapUrl ? mapUrl.trim() : '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.events.push(newEvent);
  writeStore(db);
  return newEvent;
}

export function updateEvent(code, userId, updates) {
  const db = readStore();
  const idx = db.events.findIndex(e => e.code.toUpperCase() === code.toUpperCase() && e.userId === userId);
  if (idx === -1) return null;

  const current = db.events[idx];
  const updated = {
    ...current,
    title: updates.title !== undefined ? updates.title.trim() : current.title,
    theme: updates.theme !== undefined ? updates.theme : current.theme,
    description: updates.description !== undefined ? updates.description.trim() : current.description,
    eventDate: updates.eventDate !== undefined ? updates.eventDate : current.eventDate,
    deadlineDate: updates.deadlineDate !== undefined ? updates.deadlineDate : current.deadlineDate,
    location: updates.location !== undefined ? updates.location.trim() : current.location,
    address: updates.address !== undefined ? updates.address.trim() : current.address,
    mapUrl: updates.mapUrl !== undefined ? updates.mapUrl.trim() : current.mapUrl,
    updatedAt: new Date().toISOString()
  };

  db.events[idx] = updated;
  writeStore(db);
  return updated;
}

export function deleteEvent(code, userId) {
  const db = readStore();
  const eventIdx = db.events.findIndex(e => e.code.toUpperCase() === code.toUpperCase() && e.userId === userId);
  if (eventIdx === -1) return false;

  db.events.splice(eventIdx, 1);
  // Also clean up RSVPs
  db.rsvps = db.rsvps.filter(r => r.eventCode.toUpperCase() !== code.toUpperCase());
  writeStore(db);
  return true;
}

// --- RSVP OPERATIONS ---
export function getRsvpsForEvent(eventCode) {
  const db = readStore();
  return db.rsvps
    .filter(r => r.eventCode.toUpperCase() === eventCode.toUpperCase())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function addRsvp({ eventCode, guestName, companionsCount = 0, note = '', isManual = false }) {
  const db = readStore();
  const event = db.events.find(e => e.code.toUpperCase() === eventCode.toUpperCase());
  if (!event) {
    throw new Error('El evento especificado no existe.');
  }

  // Check deadline if not manual override by organizer
  if (!isManual && isDeadlinePassed(event.deadlineDate)) {
    const formatted = formatSpanishDate(event.deadlineDate);
    throw new Error(`El periodo para confirmar asistencia concluyó el ${formatted}. Ya no es posible registrar nuevas asistencias.`);
  }

  const companions = Math.max(0, parseInt(companionsCount, 10) || 0);
  const totalSeats = 1 + companions;

  const newRsvp = {
    id: crypto.randomUUID(),
    eventCode: event.code,
    guestName: guestName.trim(),
    companionsCount: companions,
    totalSeats,
    note: note ? note.trim() : '',
    createdAt: new Date().toISOString()
  };

  db.rsvps.push(newRsvp);
  writeStore(db);
  return newRsvp;
}

export function deleteRsvp(rsvpId, eventCode) {
  const db = readStore();
  const idx = db.rsvps.findIndex(r => r.id === rsvpId && r.eventCode.toUpperCase() === eventCode.toUpperCase());
  if (idx === -1) return false;

  db.rsvps.splice(idx, 1);
  writeStore(db);
  return true;
}

export function getEventStats(eventCode) {
  const db = readStore();
  const event = db.events.find(e => e.code.toUpperCase() === eventCode.toUpperCase());
  if (!event) return null;

  const rsvps = db.rsvps.filter(r => r.eventCode.toUpperCase() === eventCode.toUpperCase());
  const totalRsvps = rsvps.length; // Titulares
  const totalCompanions = rsvps.reduce((acc, r) => acc + (r.companionsCount || 0), 0);
  const totalGuests = totalRsvps + totalCompanions; // Gran total
  const isClosed = isDeadlinePassed(event.deadlineDate);

  return {
    event,
    totalRsvps,
    totalCompanions,
    totalGuests,
    isClosed,
    deadlineFormatted: formatSpanishDate(event.deadlineDate),
    eventDateFormatted: formatSpanishDate(event.eventDate),
    rsvps
  };
}

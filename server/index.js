import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hashPassword, verifyPassword, createToken, requireAuth } from './auth.js';
import {
  findUserByEmail,
  findUserById,
  createUser,
  getEventsByUserId,
  getEventByCode,
  createEvent,
  updateEvent,
  deleteEvent,
  getRsvpsForEvent,
  addRsvp,
  deleteRsvp,
  getEventStats,
  formatSpanishDate,
  isDeadlinePassed
} from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(express.json());

// Keep-alive / Health endpoints to prevent Render from sleeping
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: Math.floor(process.uptime()), timestamp: new Date().toISOString() });
});

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static build from dist if available
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// --- AUTH ROUTES ---
app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'Ya existe una cuenta registrada con este correo.' });
    }

    const { hash, salt } = hashPassword(password);
    const user = createUser({ name, email, passwordHash: hash, salt });
    const token = createToken({ userId: user.id, email: user.email, name: user.name });

    res.status(201).json({
      message: 'Cuenta creada con éxito.',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al registrar usuario.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Ingresa correo y contraseña.' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo o contraseña.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo o contraseña.' });
    }

    const token = createToken({ userId: user.id, email: user.email, name: user.name });
    res.json({
      message: 'Inicio de sesión exitoso.',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = findUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }
  res.json({ user: { id: user.id, name: user.name, email: user.email } });
});

// --- ORGANIZER EVENT ROUTES (PROTECTED) ---
app.get('/api/events', requireAuth, (req, res) => {
  try {
    const events = getEventsByUserId(req.user.userId);
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos.' });
  }
});

app.post('/api/events', requireAuth, (req, res) => {
  try {
    const { title, theme, description, eventDate, deadlineDate, location, address, mapUrl } = req.body;
    if (!title || !deadlineDate) {
      return res.status(400).json({ error: 'El título del evento y la fecha límite son obligatorios.' });
    }

    const event = createEvent({
      userId: req.user.userId,
      title,
      theme,
      description,
      eventDate,
      deadlineDate,
      location,
      address,
      mapUrl
    });

    res.status(201).json({ message: 'Evento creado exitosamente.', event });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear evento.' });
  }
});

app.get('/api/events/:code', requireAuth, (req, res) => {
  try {
    const { code } = req.params;
    const stats = getEventStats(code);
    if (!stats || stats.event.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Evento no encontrado o no tienes permiso para verlo.' });
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar detalles del evento.' });
  }
});

app.put('/api/events/:code', requireAuth, (req, res) => {
  try {
    const { code } = req.params;
    const updated = updateEvent(code, req.user.userId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Evento no encontrado o no autorizado.' });
    }

    res.json({ message: 'Evento actualizado correctamente.', event: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar evento.' });
  }
});

app.delete('/api/events/:code', requireAuth, (req, res) => {
  try {
    const { code } = req.params;
    const deleted = deleteEvent(code, req.user.userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Evento no encontrado o no autorizado.' });
    }

    res.json({ message: 'Evento eliminado exitosamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar evento.' });
  }
});

// Manual RSVP added by Organizer
app.post('/api/events/:code/manual-rsvp', requireAuth, (req, res) => {
  try {
    const { code } = req.params;
    const event = getEventByCode(code);
    if (!event || event.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Evento no encontrado o no autorizado.' });
    }

    const { guestName, companionsCount, note } = req.body;
    if (!guestName || !guestName.trim()) {
      return res.status(400).json({ error: 'El nombre del invitado es obligatorio.' });
    }

    const rsvp = addRsvp({
      eventCode: code,
      guestName,
      companionsCount,
      note,
      isManual: true // Bypass deadline for organizer
    });

    res.status(201).json({ message: 'Invitado registrado manualmente.', rsvp });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al agregar invitado.' });
  }
});

// Delete RSVP by Organizer
app.delete('/api/events/:code/rsvp/:rsvpId', requireAuth, (req, res) => {
  try {
    const { code, rsvpId } = req.params;
    const event = getEventByCode(code);
    if (!event || event.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Evento no encontrado o no autorizado.' });
    }

    const deleted = deleteRsvp(rsvpId, code);
    if (!deleted) {
      return res.status(404).json({ error: 'Registro de asistencia no encontrado.' });
    }

    res.json({ message: 'Confirmación eliminada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar confirmación.' });
  }
});

// Export RSVPs to CSV format with general count and detailed breakdown
app.get('/api/events/:code/export', requireAuth, (req, res) => {
  try {
    const { code } = req.params;
    const event = getEventByCode(code);
    if (!event || event.userId !== req.user.userId) {
      return res.status(404).json({ error: 'Evento no encontrado.' });
    }

    const rsvps = getRsvpsForEvent(code);
    const totalRsvps = rsvps.length;
    const totalCompanions = rsvps.reduce((sum, r) => sum + (r.companionsCount || 0), 0);
    const totalGuests = totalRsvps + totalCompanions;

    // Header summary block for Excel
    const summaryLines = [
      `"REPORTE GENERAL DE ASISTENCIA"`,
      `"Evento:","${(event.title || '').replace(/"/g, '""')}"`,
      `"Código del Evento:","${code}"`,
      `"Fecha del Evento:","${formatSpanishDate(event.eventDate) || 'No especificada'}"`,
      `"Fecha Límite:","${formatSpanishDate(event.deadlineDate) || 'No especificada'}"`,
      `"Fecha de Descarga:","${formatSpanishDate(new Date().toISOString())}"`,
      ``,
      `"CONTEO GENERAL HASTA EL MOMENTO"`,
      `"TOTAL DE PERSONAS CONFIRMADAS:","${totalGuests} personas"`,
      `"Total de Titulares (Familias / Grupos):","${totalRsvps}"`,
      `"Total de Acompañantes Adicionales:","${totalCompanions}"`,
      ``,
      `"LISTA DETALLADA DE ASISTENCIA"`,
      ['"Nombre Completo"', '"Acompañantes"', '"Total Asistentes"', '"Nota / Mensaje"', '"Fecha de Confirmación"'].join(',')
    ];

    const rows = rsvps.map(r => [
      `"${(r.guestName || '').replace(/"/g, '""')}"`,
      r.companionsCount || 0,
      r.totalSeats || 1,
      `"${(r.note || '').replace(/"/g, '""')}"`,
      `"${formatSpanishDate(r.createdAt)}"`
    ]);

    // Footer summary row
    const footerRow = [
      `"TOTAL GENERAL"`,
      totalCompanions,
      totalGuests,
      `"${totalGuests} personas en total"`,
      `""`
    ];

    const csvContent = '\uFEFF' + [
      ...summaryLines,
      ...rows.map(row => row.join(',')),
      footerRow.join(',')
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="asistencia_${code}.csv"`);
    res.send(csvContent);
  } catch (err) {
    res.status(500).json({ error: 'Error al exportar reporte.' });
  }
});

// --- PUBLIC GUEST ROUTES (NO AUTH REQUIRED) ---

// Public Event Info
app.get('/api/public/event/:code', (req, res) => {
  try {
    const { code } = req.params;
    const event = getEventByCode(code);
    if (!event) {
      return res.status(404).json({ error: 'No se encontró ningún evento con ese código. Verifica el enlace.' });
    }

    const closed = isDeadlinePassed(event.deadlineDate);
    const deadlineFormatted = formatSpanishDate(event.deadlineDate);
    const eventDateFormatted = formatSpanishDate(event.eventDate);

    // Personalized deadline message requested by user
    const deadlinePrompt = closed
      ? `El periodo para confirmar asistencia concluyó el día ${deadlineFormatted}. Agradecemos mucho tu interés y comprensión.`
      : `Es importante para nosotros que confirmes tu asistencia antes del día ${deadlineFormatted}.`;

    res.json({
      code: event.code,
      title: event.title,
      theme: event.theme || 'cumpleanos',
      description: event.description,
      eventDate: event.eventDate,
      eventDateFormatted,
      deadlineDate: event.deadlineDate,
      deadlineFormatted,
      deadlinePrompt,
      isDeadlinePassed: closed,
      location: event.location,
      address: event.address,
      mapUrl: event.mapUrl
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar la invitación.' });
  }
});

// Public Guest RSVP Submission
app.post('/api/public/rsvp', (req, res) => {
  try {
    const { eventCode, guestName, companionsCount, note } = req.body;
    if (!eventCode || !guestName || !guestName.trim()) {
      return res.status(400).json({ error: 'Por favor ingresa tu nombre completo.' });
    }

    const event = getEventByCode(eventCode);
    if (!event) {
      return res.status(404).json({ error: 'El evento no existe.' });
    }

    if (isDeadlinePassed(event.deadlineDate)) {
      const deadlineFormatted = formatSpanishDate(event.deadlineDate);
      return res.status(400).json({
        error: `El plazo para confirmar asistencia venció el ${deadlineFormatted}. Ya no es posible registrar tu asistencia.`
      });
    }

    const rsvp = addRsvp({
      eventCode,
      guestName,
      companionsCount: companionsCount || 0,
      note: note || '',
      isManual: false
    });

    res.status(201).json({
      message: '¡Confirmación registrada con éxito!',
      rsvp: {
        id: rsvp.id,
        guestName: rsvp.guestName,
        companionsCount: rsvp.companionsCount,
        totalSeats: rsvp.totalSeats,
        note: rsvp.note
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Error al registrar tu confirmación.' });
  }
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(200).send('Servidor activo. Construyendo interfaz...');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de Fiesta RSVP ejecutándose en http://localhost:${PORT}`);
});

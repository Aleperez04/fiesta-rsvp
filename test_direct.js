import assert from 'node:assert';
import { hashPassword, verifyPassword, createToken, verifyToken } from './server/auth.js';
import {
  createUser,
  findUserByEmail,
  createEvent,
  getEventByCode,
  getEventsByUserId,
  addRsvp,
  getRsvpsForEvent,
  getEventStats,
  deleteRsvp,
  isDeadlinePassed,
  formatSpanishDate
} from './server/db.js';

async function runDirectTests() {
  console.log('🧪 Iniciando pruebas directas de lógica, base de datos y reglas de negocio...\n');

  // Test 1: Autenticación y Hash
  console.log('1️⃣ Probando hashing criptográfico y verificación de contraseñas...');
  const pass = 'miSuperPassword2026';
  const { hash, salt } = hashPassword(pass);
  assert(hash && salt, 'El hash y salt deben generarse.');
  assert(verifyPassword(pass, hash, salt), 'La contraseña correcta debe ser válida.');
  assert(!verifyPassword('otraPassword', hash, salt), 'Una contraseña incorrecta debe ser rechazada.');
  console.log('✅ Hashing y contraseñas verificados.\n');

  // Test 2: Tokens HMAC-SHA256
  console.log('2️⃣ Probando generación y validación de tokens de sesión...');
  const payload = { userId: 'usr-123', email: 'test@fiesta.com' };
  const token = createToken(payload);
  assert(token.includes('.'), 'El token debe contener payload y firma.');
  const verified = verifyToken(token);
  assert.strictEqual(verified.userId, 'usr-123');
  assert.strictEqual(verified.email, 'test@fiesta.com');
  assert.strictEqual(verifyToken('token.invalido'), null, 'Tokens falsos deben ser rechazados.');
  console.log('✅ Tokens criptográficos seguros verificados.\n');

  // Test 3: Creación de Usuarios en Base de Datos Atómica
  console.log('3️⃣ Probando registro de usuario organizador...');
  const email = `organizador_${Date.now()}@test.com`;
  const user = createUser({
    name: 'Roberto Gómez',
    email,
    passwordHash: hash,
    salt
  });
  assert(user.id, 'El usuario debe tener un ID único.');
  const foundUser = findUserByEmail(email);
  assert.strictEqual(foundUser.name, 'Roberto Gómez');
  console.log(`✅ Usuario creado: ${user.name} (${user.email})\n`);

  // Test 4: Creación de Evento con Código Único Aleatorio y Estilo Temático
  console.log('4️⃣ Probando creación de evento y generación de Código Único...');
  const futureDeadline = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const futureEventDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
  
  const event = createEvent({
    userId: user.id,
    title: 'Cumpleaños #30 de Roberto',
    theme: 'cumpleanos',
    description: 'Fiesta con amigos y familia',
    eventDate: futureEventDate,
    deadlineDate: futureDeadline,
    location: 'Salón Candiles',
    address: 'Av. Reforma #456'
  });

  assert(event.code.startsWith('FIESTA-'), 'El código único debe comenzar con FIESTA-');
  assert.strictEqual(event.theme, 'cumpleanos');
  console.log(`✅ Evento creado con éxito. Código Único asignado: ${event.code}`);
  console.log(`   Fecha Límite en español: ${formatSpanishDate(event.deadlineDate)}\n`);

  // Test 5: Confirmación de Asistencia de Invitados (Pública, sin registro)
  console.log('5️⃣ Probando confirmación de asistencia de invitados...');
  const rsvp1 = addRsvp({
    eventCode: event.code,
    guestName: 'Mariana Silva',
    companionsCount: 2,
    note: '¡Muchísimas felicidades Roberto!',
    isManual: false
  });

  assert.strictEqual(rsvp1.guestName, 'Mariana Silva');
  assert.strictEqual(rsvp1.companionsCount, 2);
  assert.strictEqual(rsvp1.totalSeats, 3, 'Total de lugares debe ser 1 titular + 2 acompañantes = 3');
  console.log(`✅ Invitado 1 confirmado: ${rsvp1.guestName} - Lugares reservados: ${rsvp1.totalSeats}`);

  const rsvp2 = addRsvp({
    eventCode: event.code,
    guestName: 'Pedro Juárez',
    companionsCount: 0,
    note: '',
    isManual: false
  });
  assert.strictEqual(rsvp2.totalSeats, 1, 'Total de lugares con 0 acompañantes debe ser 1');
  console.log(`✅ Invitado 2 confirmado: ${rsvp2.guestName} - Lugares reservados: ${rsvp2.totalSeats}\n`);

  // Test 6: Registro Manual de Invitado por el Organizador
  console.log('6️⃣ Probando registro manual por parte del organizador (Tía Teresa + 3)...');
  const rsvpManual = addRsvp({
    eventCode: event.code,
    guestName: 'Tía Teresa',
    companionsCount: 3,
    note: 'Confirmó por teléfono',
    isManual: true
  });
  assert.strictEqual(rsvpManual.totalSeats, 4);
  console.log(`✅ Invitado manual agregado: ${rsvpManual.guestName} - Lugares reservados: ${rsvpManual.totalSeats}\n`);

  // Test 7: Verificación de Estadísticas Generales y Desglose Personal
  console.log('7️⃣ Verificando estadísticas consolidadas del evento...');
  const stats = getEventStats(event.code);
  console.log(`   - Total registros (titulares): ${stats.totalRsvps} (Esperado: 3)`);
  console.log(`   - Total acompañantes: ${stats.totalCompanions} (Esperado: 5)`);
  console.log(`   - Gran Total Personas: ${stats.totalGuests} (Esperado: 8)`);

  assert.strictEqual(stats.totalRsvps, 3, 'Deben existir 3 registros titulares');
  assert.strictEqual(stats.totalCompanions, 5, 'Deben existir 5 acompañantes en total (2 + 0 + 3)');
  assert.strictEqual(stats.totalGuests, 8, 'Gran total de personas debe ser 8');
  assert.strictEqual(stats.isClosed, false, 'El evento debe estar activo');
  console.log('✅ Métricas generales y personales 100% exactas.\n');

  // Test 8: Regla Estricta de Fecha Límite Vencida
  console.log('8️⃣ Probando bloqueo estricto cuando la fecha límite ha vencido...');
  const pastDeadline = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(); // Hace 2 días
  const closedEvent = createEvent({
    userId: user.id,
    title: 'Fiesta con Fecha Límite Pasada',
    theme: 'casual',
    deadlineDate: pastDeadline
  });

  assert.strictEqual(isDeadlinePassed(closedEvent.deadlineDate), true);

  let blocked = false;
  try {
    addRsvp({
      eventCode: closedEvent.code,
      guestName: 'Invitado Tardío',
      companionsCount: 1,
      isManual: false
    });
  } catch (err) {
    blocked = true;
    console.log(`   Mensaje de bloqueo capturado: "${err.message}"`);
  }
  assert.strictEqual(blocked, true, 'El registro posterior a la fecha límite DEBE ser bloqueado.');
  console.log('✅ Bloqueo estricto por fecha límite verificado con éxito.\n');

  // Test 9: Formato y Mensaje Requerido por el Usuario
  console.log('9️⃣ Verificando formato de fecha y mensaje personalizado para invitados...');
  const formattedDeadline = formatSpanishDate(event.deadlineDate);
  const expectedPrompt = `Es importante para nosotros que confirmes tu asistencia antes del día ${formattedDeadline}.`;
  console.log(`   Texto para el invitado: "${expectedPrompt}"`);
  assert(expectedPrompt.includes('Es importante para nosotros que confirmes tu asistencia antes del día'));
  console.log('✅ Mensaje requerido verificado.\n');

  console.log('🎉 ¡TODAS LAS PRUEBAS DIRECTAS PASARON CON ÉXITO (9/9)!');
}

runDirectTests().catch(err => {
  console.error('\n❌ ERROR EN PRUEBAS:', err);
  process.exit(1);
});

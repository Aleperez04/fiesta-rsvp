# 🎉 Fiesta RSVP - Plataforma de Confirmación de Asistencia

Sistema web completo y moderno para la gestión de confirmaciones de asistencia (RSVP) a fiestas y eventos con organizadores autenticados e invitados **100% libres de registro**.

---

## 🚀 Inicio Rápido

Para iniciar el servidor y abrir la aplicación en tu navegador:

```bash
# 1. Navega a la carpeta del proyecto:
cd C:\Users\alepe\.gemini\antigravity\scratch\fiesta-rsvp

# 2. Inicia el servidor:
npm start
# O directamente con node:
node server/index.js
```

Abre en tu navegador:
👉 **`http://localhost:5000`**

---

## 🌟 Características Principales

### 1. 📱 Para los Invitados (Sin Registro)
- **Cero Registro**: No necesitan contraseñas ni descargar aplicaciones. Acceden mediante el enlace único del evento (ej: `/e/FIESTA-G5NX`).
- **Formulario Ágil**: Ingresan su nombre completo, seleccionan acompañantes (+0, +1, +2...) con cálculo automático de lugares reservados, y un campo opcional para notas/alergias/felicitaciones.
- **Mensaje Destacado de Fecha Límite**:
  > *"Es importante para nosotros que confirmes tu asistencia antes del día [Fecha límite]."*
- **Control Estricto de Cierre**: Al cumplirse la fecha límite establecida por el organizador, el formulario se bloquea y se muestra un mensaje informativo cordial.
- **Celebración con Confeti**: Al confirmar, disfrutan de una animación festiva y su resumen de reserva listo para compartir.

### 2. 🎨 Estilos Temáticos Predeterminados
Cada evento adopta automáticamente su paleta de colores, adornos y tipografías:
- 🎂 **Cumpleaños**: Púrpura y fucsia vibrante con confeti festivo.
- 🎈 **Fiesta Infantil**: Multicolor divertido (amarillo, turquesa, coral) con temática lúdica.
- 🍼 **Revelación de Género**: Suaves tonos pastel rosa y azul celeste "¿Niño o Niña?".
- 💍 **Boda / Aniversario**: Blanco marfil, champán y dorado elegante.
- 🍕 **Fiesta Casual / BBQ**: Naranja cálido y estilo relajado.
- 🎓 **Graduación**: Azul marino profundo y oro metálico.

### 3. 👑 Para el Administrador / Organizador
- **Sistema de Cuentas**: Botones de **Iniciar Sesión** y **Registrarse** en la barra superior.
- **Códigos Únicos Aleatorios**: Cada evento recibe un código propio (ej: `FIESTA-G5NX`) y un botón para copiar el enlace o compartirlo directamente en WhatsApp con texto listo.
- **Métricas Generales**:
  - Total de registros (titulares).
  - Total de acompañantes.
  - Gran total de personas confirmadas.
  - Estado del plazo (Abierto / Cerrado).
- **Desglose Personal (Tabla Detallada)**:
  - Lista completa de confirmados con nombre, lugares, notas y fecha.
  - Búsqueda en tiempo real por nombre de invitado.
  - Registro manual de invitados (para quienes confirmaron por llamada o WhatsApp).
  - Descarga en Excel / CSV y vista optimizada para imprimir lista en puerta.
  - Edición en caliente de fecha límite, título y detalles.

---

## 📁 Estructura del Proyecto

```
fiesta-rsvp/
├── server/
│   ├── index.js          # API REST Express y servidor de producción
│   ├── auth.js           # Hashing criptográfico y tokens de sesión
│   ├── db.js             # Persistencia atómica y reglas de negocio
│   └── data/
│       └── store.json    # Base de datos atómica en JSON
├── src/
│   ├── App.jsx           # Enrutamiento y control de vistas
│   ├── main.jsx          # Montaje de React
│   ├── themes.js         # Catálogo de estilos predeterminados
│   └── components/
│       ├── Navbar.jsx           # Barra de navegación con auth
│       ├── Home.jsx             # Portada y buscador rápido de código
│       ├── Dashboard.jsx        # Panel general de eventos del usuario
│       ├── EventDetailAdmin.jsx # Métricas, tabla personal y herramientas
│       ├── GuestEventView.jsx   # Vista de invitado con temáticas
│       ├── CreateEventModal.jsx # Selector de estilo y fecha límite
│       ├── AuthModal.jsx        # Login y registro de organizadores
│       └── CountdownTimer.jsx   # Reloj de cuenta regresiva
├── dist/                 # Build de producción optimizado de Vite
└── test_direct.js        # Suite de pruebas automatizadas
```

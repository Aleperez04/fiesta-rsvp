import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const URL_FILE = path.join(__dirname, 'public_url.txt');

console.log('🚀 Iniciando servidor Fiesta RSVP en puerto 5050...');

// 1. Iniciar servidor Express en este mismo proceso
process.env.PORT = '5050';
await import('./server/index.js');

console.log('🌐 Conectando túnel seguro a la web con Pinggy...');

// 2. Iniciar túnel SSH seguro con Pinggy hacia localhost:5050
function startTunnel() {
  const ssh = spawn('ssh', [
    '-p', '443',
    '-R0:localhost:5050',
    '-o', 'StrictHostKeyChecking=no',
    '-o', 'ServerAliveInterval=30',
    'a.pinggy.io'
  ], {
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let captured = false;

  const handleOutput = (data) => {
    const raw = data.toString();
    const text = raw.replace(/\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])/g, '');
    process.stdout.write(text);

    const matches = text.match(/https:\/\/[a-zA-Z0-9-]+\.(?:a\.free\.pinggy\.link|a\.pinggy\.link|pinggy\.link)/);
    if (matches && !captured) {
      captured = true;
      const publicUrl = matches[0];
      fs.writeFileSync(URL_FILE, publicUrl, 'utf-8');

      console.log('\n=============================================================');
      console.log('🎉 ¡TU PÁGINA YA ESTÁ EN VIVO EN INTERNET!');
      console.log(`👉 ENLACE PÚBLICO: ${publicUrl}`);
      console.log('=============================================================\n');
    }
  };

  ssh.stdout.on('data', handleOutput);
  ssh.stderr.on('data', handleOutput);

  ssh.on('close', (code) => {
    console.log(`Túnel cerrado (código ${code}). Reconectando en 5s...`);
    setTimeout(startTunnel, 5000);
  });
}

// Iniciar el túnel inmediatamente
startTunnel();

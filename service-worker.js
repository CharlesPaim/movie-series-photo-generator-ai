// Este é um service worker mínimo para tornar o aplicativo instalável.

self.addEventListener('install', (event) => {
  console.log('Service worker: Instalando...');
});

self.addEventListener('activate', (event) => {
  console.log('Service worker: Ativando...');
});

self.addEventListener('fetch', (event) => {
  // Um manipulador de busca básico é necessário para que o aplicativo seja instalável.
  // Este não faz nada e apenas deixa o navegador cuidar da requisição.
  return;
});

import { createServer } from 'vite';

async function main() {
  console.log('Initializing Vite server...');
  try {
    const server = await createServer({
      configFile: './vite.config.js',
      server: {
        port: 5190,
        host: '0.0.0.0',
      },
    });
    console.log('Calling server.listen()...');
    await server.listen();
    server.printUrls();
    console.log('SERVER IS READY!');
  } catch (err) {
    console.error('SERVER INIT ERROR:', err);
    process.exit(1);
  }
}

main();

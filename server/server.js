import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);


import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { setupSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

setupSocket(server);

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
      );
      console.log(`SMTP configured: ${process.env.SMTP_USER ? 'yes' : 'no'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

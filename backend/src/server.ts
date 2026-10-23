import app from './app';
import { ENV } from './config/env';

const server = app.listen(ENV.PORT, () => {
  console.log(`🚀 HostelHub Backend running at http://localhost:${ENV.PORT}`);
  console.log(`📊 Health check available at http://localhost:${ENV.PORT}/api/v1/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

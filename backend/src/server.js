import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { router as apiRouter } from './routes/index.js';

const app = express();

// Build allowed origins list. Default to * if APP_ORIGIN is not set.
const rawOrigins = process.env.APP_ORIGIN || '*';
const allowedOrigins = rawOrigins === '*' ? ['*'] : rawOrigins.split(',').map(s => s.trim());

// CORS options: if '*' is allowed, use simple cors middleware; otherwise validate origin per request.
const corsOptions = allowedOrigins.includes('*')
  ? {}
  : {
    origin: (origin, callback) => {
      // Allow non-browser requests like curl/postman (no origin)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
  };

app.use(cors(corsOptions));

// Ensure preflight requests are answered for all routes
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

app.use('/api', apiRouter);

// Error handler: surface CORS errors with 401 when thrown by corsOptions
app.use((err, req, res, _next) => {
  console.error('Error handler:', err && err.message ? err.message : err);
  if (err && err.message && err.message.startsWith('The CORS policy')) {
    return res.status(401).json({ message: err.message });
  }
  res.status(err && err.status ? err.status : 500).json({ message: err && err.message ? err.message : 'Internal Server Error' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log('Allowed origins:', allowedOrigins);
});



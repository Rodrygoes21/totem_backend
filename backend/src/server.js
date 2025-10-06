import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { router as apiRouter } from './routes/index.js';

const app = express();

app.use(cors({ origin: process.env.APP_ORIGIN?.split(',') || '*'}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

app.use('/api', apiRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});



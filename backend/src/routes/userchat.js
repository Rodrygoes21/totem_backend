import { Router } from 'express';
import { makeCrudRouter } from '../utils/crud.js';
import pool from '../db/pool.js';

const router = makeCrudRouter('UserChat');

// Responder a una pregunta
router.post('/:id/responder', async (req, res, next) => {
  try {
    const { respuesta } = req.body || {};
    if (!respuesta) return res.status(400).json({ message: 'respuesta es requerida' });
    await pool.query(
      'UPDATE `UserChat` SET `respuesta` = ?, `estado` = ?, `fecha_respuesta` = NOW() WHERE `id` = ?;',
      [respuesta, 'respondida', req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM `UserChat` WHERE `id` = ? LIMIT 1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

export default router;



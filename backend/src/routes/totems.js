import { Router } from 'express';
import { makeCrudRouter } from '../utils/crud.js';
import pool from '../db/pool.js';

const router = makeCrudRouter('TOTEM');

// Extra: incluir joins comunes
router.get('/:id/detalle', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, i.nombre AS institucion_nombre, c.nombre AS categoria_nombre
       FROM \`TOTEM\` t
       LEFT JOIN \`Institucion\` i ON t.institucion_id = i.id
       LEFT JOIN \`Categoria\` c ON t.categoria_id = c.id
       WHERE t.id = ?
       LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'Not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

export default router;



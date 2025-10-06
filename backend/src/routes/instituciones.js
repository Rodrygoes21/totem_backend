import { makeCrudRouter } from '../utils/crud.js';
import pool from '../db/pool.js';

const router = makeCrudRouter('Institucion');

// Seed random instituciones
router.post('/seed', async (req, res, next) => {
  try {
    const count = Math.max(1, Math.min(100, Number(req.query.count || req.body?.count || 5)));

    const baseNames = [
      'Universidad', 'Hospital', 'Museo', 'Biblioteca', 'Colegio', 'Centro Cultural',
      'Ayuntamiento', 'Parque', 'Teatro', 'Estadio', 'Clínica', 'Facultad', 'Instituto'
    ];
    const suffixes = [
      'Nacional', 'Central', 'Municipal', 'Metropolitano', 'Regional', 'Popular',
      'Del Norte', 'Del Sur', 'Del Este', 'Del Oeste', 'Principal', 'General', 'Del Centro'
    ];

    const values = Array.from({ length: count }, () => {
      const a = baseNames[Math.floor(Math.random() * baseNames.length)];
      const b = suffixes[Math.floor(Math.random() * suffixes.length)];
      const num = Math.random() < 0.4 ? '' : ` ${Math.floor(Math.random() * 100)}`;
      return [`${a} ${b}${num}`];
    });

    const placeholders = values.map(() => '(?)').join(', ');
    const flatValues = values.flat();

    const sql = `INSERT INTO \`Institucion\` (\`nombre\`) VALUES ${placeholders}`;
    const [result] = await pool.query(sql, flatValues);

    res.status(201).json({ inserted: result.affectedRows });
  } catch (err) { next(err); }
});

export default router;



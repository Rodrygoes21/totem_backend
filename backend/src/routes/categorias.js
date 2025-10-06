import { makeCrudRouter } from '../utils/crud.js';
import pool from '../db/pool.js';

const router = makeCrudRouter('Categoria');

// Seed random categorias
router.post('/seed', async (req, res, next) => {
  try {
    const count = Math.max(1, Math.min(100, Number(req.query.count || req.body?.count || 5)));

    const baseNames = [
      'Información General', 'Servicios', 'Historia', 'Contacto', 'Eventos', 'Noticias',
      'Trámites', 'Admisiones', 'Cultura', 'Deportes', 'Salud', 'Biblioteca', 'Turismo'
    ];
    const infoPhrases = [
      'Información básica y general del lugar',
      'Servicios disponibles en la institución',
      'Información histórica y cultural',
      'Datos de contacto y ubicación',
      'Calendario y detalles de próximos eventos',
      'Últimas novedades y anuncios',
      'Guía de trámites y requisitos',
      'Proceso y requisitos de admisión',
      'Agenda cultural y actividades',
      'Actividades y reservas deportivas',
      'Orientación y servicios de salud',
      'Catálogo y préstamos de biblioteca',
      'Puntos de interés y visitas'
    ];
    const icons = [
      'info-icon', 'services-icon', 'history-icon', 'contact-icon', 'event-icon', 'news-icon',
      'form-icon', 'admission-icon', 'culture-icon', 'sports-icon', 'health-icon', 'library-icon', 'tour-icon'
    ];

    const values = Array.from({ length: count }, () => {
      const idx = Math.floor(Math.random() * baseNames.length);
      const suffix = Math.random() < 0.5 ? '' : ` ${Math.floor(Math.random() * 100)}`;
      return [
        `${baseNames[idx]}${suffix}`,
        infoPhrases[idx],
        icons[idx]
      ];
    });

    const placeholders = values.map(() => '(?, ?, ?)').join(', ');
    const flatValues = values.flat();

    const sql = `INSERT INTO \`Categoria\` (\`nombre\`, \`informacion\`, \`icon\`) VALUES ${placeholders}`;
    const [result] = await pool.query(sql, flatValues);

    res.status(201).json({ inserted: result.affectedRows });
  } catch (err) { next(err); }
});

export default router;



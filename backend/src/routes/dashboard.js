import { Router } from 'express';
import pool from '../db/pool.js';

const router = Router();

// GET /api/dashboard/stats - Obtener estadísticas generales
router.get('/stats', async (req, res) => {
  try {
    // Estadísticas de usuarios por rol
    const [usuariosPorRol] = await pool.query(`
      SELECT rol, COUNT(*) as cantidad
      FROM Usuario
      GROUP BY rol
    `);

    // Estadísticas de instituciones
    const [totalInstituciones] = await pool.query(`
      SELECT COUNT(*) as total FROM Institucion
    `);

    // Estadísticas de categorías
    const [totalCategorias] = await pool.query(`
      SELECT COUNT(*) as total FROM Categoria
    `);

    // Estadísticas de totems
    const [totalTotems] = await pool.query(`
      SELECT COUNT(*) as total FROM TOTEM
    `);

    // Estadísticas de multimedia
    const [multimediaPorTipo] = await pool.query(`
      SELECT tipo_multimedia, COUNT(*) as cantidad
      FROM Multimedia
      GROUP BY tipo_multimedia
    `);

    // Estadísticas de chats
    const [chatsPorEstado] = await pool.query(`
      SELECT estado, COUNT(*) as cantidad
      FROM UserChat
      GROUP BY estado
    `);

    // Estadísticas recientes (últimos 7 días)
    const [actividadReciente] = await pool.query(`
      SELECT
        DATE(fecha_creacion) as fecha,
        COUNT(*) as totems_creados
      FROM TOTEM
      WHERE fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(fecha_creacion)
      ORDER BY fecha DESC
    `);

    // Estadísticas de preguntas recientes (últimas 24 horas)
    const [preguntasRecientes] = await pool.query(`
      SELECT COUNT(*) as total
      FROM UserChat
      WHERE fecha_pregunta >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    const stats = {
      usuarios: {
        por_rol: usuariosPorRol,
        total: usuariosPorRol.reduce((acc, curr) => acc + parseInt(curr.cantidad), 0)
      },
      instituciones: {
        total: parseInt(totalInstituciones[0].total)
      },
      categorias: {
        total: parseInt(totalCategorias[0].total)
      },
      totems: {
        total: parseInt(totalTotems[0].total)
      },
      multimedia: {
        por_tipo: multimediaPorTipo,
        total: multimediaPorTipo.reduce((acc, curr) => acc + parseInt(curr.cantidad), 0)
      },
      chats: {
        por_estado: chatsPorEstado,
        total: chatsPorEstado.reduce((acc, curr) => acc + parseInt(curr.cantidad), 0),
        preguntas_recientes_24h: parseInt(preguntasRecientes[0].total)
      },
      actividad_reciente: actividadReciente,
      ultima_actualizacion: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

export default router;

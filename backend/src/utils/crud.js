import { Router } from 'express';
import pool from '../db/pool.js';

async function runQuery(sql, params = []) {
  try {
    return await pool.query(sql, params);
  } catch (err) {
    // Attach query details to the error to aid debugging upstream
    try { err.sql = sql; } catch (e) {}
    try { err.sqlParams = params; } catch (e) {}
    throw err;
  }
}

function buildSetClauseAndValues(payload) {
  const entries = Object.entries(payload).filter(([key, value]) => key !== 'id' && value !== undefined);
  const columns = entries.map(([key]) => `\`${key}\``);
  const values = entries.map(([, value]) => value);
  const placeholders = entries.map(() => '?');
  return { columns, values, placeholders };
}

export function makeCrudRouter(tableName, idColumn = 'id') {
  const router = Router();

  // Define allowed columns per table to avoid SQL errors when client sends extra fields
  const tableColumns = {
    TOTEM: ['nombre_to', 'ubicacion', 'color', 'institucion_id', 'categoria_id']
    // add other tables here if you want to whitelist columns
  };

  // Helper to normalize payload keys and filter only allowed columns for the table
  function normalizePayload(payload) {
    if (!payload || typeof payload !== 'object') return {};
    const p = { ...payload };
    if (tableName === 'TOTEM') {
      // Map frontend field 'nombre' to DB column 'nombre_to'
      if (p.nombre !== undefined && p.nombre_to === undefined) {
        p.nombre_to = p.nombre;
      }
      // If frontend sends boolean 'activo' but DB doesn't have it, ignore it for now
      // If you want to persist it, add a column to the DB (see instructions)
      if (p.activo !== undefined) {
        // keep it but it will be filtered out unless added to tableColumns
      }
    }
    const allowed = tableColumns[tableName] || null;
    if (!allowed) return p; // no whitelist -> keep all keys
    // filter to allowed keys only
    return Object.fromEntries(Object.entries(p).filter(([k]) => allowed.includes(k)));
  }

  // List
  router.get('/', async (req, res, next) => {
    try {
      const [rows] = await runQuery(`SELECT * FROM \`${tableName}\``);
      res.json(rows);
    } catch (err) { next(err); }
  });

  // Get by id
  router.get(`/:id`, async (req, res, next) => {
    try {
  const [rows] = await runQuery(`SELECT * FROM \`${tableName}\` WHERE \`${idColumn}\` = ? LIMIT 1`, [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: 'Not found' });
      res.json(rows[0]);
    } catch (err) { next(err); }
  });

  // Create
  router.post('/', async (req, res, next) => {
    try {
      const raw = req.body || {};
      const payload = normalizePayload(raw);
      const { columns, values, placeholders } = buildSetClauseAndValues(payload);
      if (!columns.length) return res.status(400).json({ message: 'No fields to insert' });
      const sql = `INSERT INTO \`${tableName}\` (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
  const [result] = await runQuery(sql, values);
  const [rows] = await runQuery(`SELECT * FROM \`${tableName}\` WHERE \`${idColumn}\` = ?`, [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  });

  // Update (partial)
  router.patch(`/:id`, async (req, res, next) => {
    try {
      const raw = req.body || {};
      const payload = normalizePayload(raw);
      const { columns, values } = buildSetClauseAndValues(payload);
      if (!columns.length) return res.status(400).json({ message: 'No fields to update' });
      const setClause = columns.map((c) => `${c} = ?`).join(', ');
      const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE \`${idColumn}\` = ?`;
  await runQuery(sql, [...values, req.params.id]);
  const [rows] = await runQuery(`SELECT * FROM \`${tableName}\` WHERE \`${idColumn}\` = ?`, [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: 'Not found' });
      res.json(rows[0]);
    } catch (err) { next(err); }
  });

  // Delete
  router.delete(`/:id`, async (req, res, next) => {
    try {
  const sql = `DELETE FROM \`${tableName}\` WHERE \`${idColumn}\` = ?`;
  const [result] = await runQuery(sql, [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
      res.status(204).send();
    } catch (err) { next(err); }
  });

  return router;
}



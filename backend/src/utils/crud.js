import { Router } from 'express';
import pool from '../db/pool.js';

function buildSetClauseAndValues(payload) {
  const entries = Object.entries(payload).filter(([key, value]) => key !== 'id' && value !== undefined);
  const columns = entries.map(([key]) => `\`${key}\``);
  const values = entries.map(([, value]) => value);
  const placeholders = entries.map(() => '?');
  return { columns, values, placeholders };
}

export function makeCrudRouter(tableName, idColumn = 'id') {
  const router = Router();

  // List
  router.get('/', async (req, res, next) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\``);
      res.json(rows);
    } catch (err) { next(err); }
  });

  // Get by id
  router.get(`/:id`, async (req, res, next) => {
    try {
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE \`${idColumn}\` = ? LIMIT 1`, [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: 'Not found' });
      res.json(rows[0]);
    } catch (err) { next(err); }
  });

  // Create
  router.post('/', async (req, res, next) => {
    try {
      const payload = req.body || {};
      const { columns, values, placeholders } = buildSetClauseAndValues(payload);
      if (!columns.length) return res.status(400).json({ message: 'No fields to insert' });
      const sql = `INSERT INTO \`${tableName}\` (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
      const [result] = await pool.query(sql, values);
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE \`${idColumn}\` = ?`, [result.insertId]);
      res.status(201).json(rows[0]);
    } catch (err) { next(err); }
  });

  // Update (partial)
  router.patch(`/:id`, async (req, res, next) => {
    try {
      const payload = req.body || {};
      const { columns, values } = buildSetClauseAndValues(payload);
      if (!columns.length) return res.status(400).json({ message: 'No fields to update' });
      const setClause = columns.map((c) => `${c} = ?`).join(', ');
      const sql = `UPDATE \`${tableName}\` SET ${setClause} WHERE \`${idColumn}\` = ?`;
      await pool.query(sql, [...values, req.params.id]);
      const [rows] = await pool.query(`SELECT * FROM \`${tableName}\` WHERE \`${idColumn}\` = ?`, [req.params.id]);
      if (!rows.length) return res.status(404).json({ message: 'Not found' });
      res.json(rows[0]);
    } catch (err) { next(err); }
  });

  // Delete
  router.delete(`/:id`, async (req, res, next) => {
    try {
      const [result] = await pool.query(`DELETE FROM \`${tableName}\` WHERE \`${idColumn}\` = ?`, [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
      res.status(204).send();
    } catch (err) { next(err); }
  });

  return router;
}



const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAdmin = require('../middleware/auth');

function generateReferenceCode(id) {
  const year = new Date().getFullYear();
  return `HMR-${year}-${String(id).padStart(4, '0')}`;
}

// POST /api/requests  -> anyone can submit a request (no login needed)
router.post('/', async (req, res) => {
  try {
    const { reporter_name, department, equipment_name, location, issue_description, priority, contact_info } = req.body;

    if (!reporter_name || !equipment_name || !location || !issue_description) {
      return res.status(400).json({ error: 'reporter_name, equipment_name, location and issue_description are required.' });
    }

    const insertResult = await pool.query(
      `INSERT INTO requests (reference_code, reporter_name, department, equipment_name, location, issue_description, priority, contact_info)
       VALUES ('TEMP', $1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [reporter_name, department || null, equipment_name, location, issue_description, priority || 'medium', contact_info || null]
    );

    const newId = insertResult.rows[0].id;
    const referenceCode = generateReferenceCode(newId);

    const finalResult = await pool.query(
      `UPDATE requests SET reference_code = $1 WHERE id = $2 RETURNING *`,
      [referenceCode, newId]
    );

    res.status(201).json({ message: 'Request submitted successfully.', request: finalResult.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while submitting request.' });
  }
});

router.get('/track/:reference_code', async (req, res) => {
  try {
    const { reference_code } = req.params;
    const result = await pool.query('SELECT * FROM requests WHERE reference_code = $1', [reference_code]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No request found with that reference code.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while tracking request.' });
  }
});

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    let query = 'SELECT * FROM requests WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      query += ` AND priority = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (equipment_name ILIKE $${params.length} OR department ILIKE $${params.length} OR location ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching requests.' });
  }
});

router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
        COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved
      FROM requests
    `);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching stats.' });
  }
});

router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      technician_notes,
      reporter_name,
      contact_info,
      equipment_name,
      location,
      priority
    } = req.body;

    const result = await pool.query(
      `UPDATE requests
       SET status = COALESCE($1, status),
           technician_notes = COALESCE($2, technician_notes),
           reporter_name = COALESCE($3, reporter_name),
           contact_info = COALESCE($4, contact_info),
           equipment_name = COALESCE($5, equipment_name),
           location = COALESCE($6, location),
           priority = COALESCE($7, priority)
       WHERE id = $8
       RETURNING *`,
      [
        status || null,
        technician_notes || null,
        reporter_name || null,
        contact_info || null,
        equipment_name || null,
        location || null,
        priority || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }

    res.json({ message: 'Request updated.', request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while updating request.' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM requests WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found.' });
    }
    res.json({ message: 'Request deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while deleting request.' });
  }
});

module.exports = router;

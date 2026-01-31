const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dniController');
const auth = require('../middleware/auth');

// Require authentication for all /api/dni routes
router.use(auth.verifyToken);

// Anyone authenticated (admin/policia/medico) can search and view
router.get('/search', ctrl.search);
router.get('/:id', ctrl.get);

// Create user: only admin
router.post('/', auth.requireAnyRole(['admin']), ctrl.create);

// Multas: add/remove -> policia or admin
router.post('/:id/multas', auth.requireAnyRole(['policia', 'admin']), ctrl.addMulta);
router.delete('/:id/multas/:multaId', auth.requireAnyRole(['policia', 'admin']), ctrl.removeMulta);

// Antecedentes: policia or admin
router.post('/:id/antecedentes', auth.requireAnyRole(['policia', 'admin']), ctrl.addAntecedente);
router.delete('/:id/antecedentes/:antecedenteId', auth.requireAnyRole(['policia', 'admin']), ctrl.removeAntecedente);

// Atestados: medico or admin can add/remove; anyone authenticated can view
router.post('/:id/atestados', auth.requireAnyRole(['medico', 'admin']), ctrl.addAtestado);
router.delete('/:id/atestados/:atestadoId', auth.requireAnyRole(['medico', 'admin']), ctrl.removeAtestado);

// Busqueda: policia or admin can set
router.put('/:id/busqueda', auth.requireAnyRole(['policia', 'admin']), ctrl.setBusqueda);

module.exports = router;
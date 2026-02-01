const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dniController');

// Public API for DNI resources (no auth)

// Search and get
router.get('/search', ctrl.search);
router.get('/:id', ctrl.get);

// Create user
router.post('/', ctrl.create);

// Multas
router.post('/:id/multas', ctrl.addMulta);
router.delete('/:id/multas/:multaId', ctrl.removeMulta);

// Antecedentes
router.post('/:id/antecedentes', ctrl.addAntecedente);
router.delete('/:id/antecedentes/:antecedenteId', ctrl.removeAntecedente);

// Atestados
router.post('/:id/atestados', ctrl.addAtestado);
router.delete('/:id/atestados/:atestadoId', ctrl.removeAtestado);

// Busqueda
router.put('/:id/busqueda', ctrl.setBusqueda);

// Carnet routes
router.put('/:id/carnet', ctrl.setCarnet);               // set/update carnet
router.post('/:id/carnet/deduct', ctrl.deductPuntos);    // quitar puntos

router.get('/deudores', ctrl.listDeudores); // lista todos los que tienen multas
router.get('/buscados', ctrl.listBuscados); // lista todos los que están en busqueda.activo = true

module.exports = router;
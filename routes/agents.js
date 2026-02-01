const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/agentsController');

// CRUD/operaciones básicas
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

// Fichar / terminar servicio
router.post('/:id/fichar', ctrl.fichar);
router.post('/:id/terminar', ctrl.terminarServicio);

module.exports = router;
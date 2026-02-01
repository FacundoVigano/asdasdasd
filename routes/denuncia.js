const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/denunciaController');

// Crear, listar, obtener
router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);

// Añadir ciudadano / agente a denuncia existente
router.post('/:id/ciudadanos', ctrl.addCiudadano);
router.post('/:id/agentes', ctrl.addAgente);

// Actualizar estado
router.put('/:id/estado', ctrl.updateEstado);

module.exports = router;
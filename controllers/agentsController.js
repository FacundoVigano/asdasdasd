const Agent = require('../models/Agent');
const Denuncia = require('../models/Denuncia');
const mongoose = require('mongoose');

exports.create = async (req, res) => {
  try {
    const { nombre, placa, rango, creadoPor, discordUserId, notas } = req.body;
    if (!nombre) return res.status(400).json({ error: 'nombre requerido' });
    const agent = new Agent({ nombre, placa, rango, creadoPor, discordUserId, notas });
    await agent.save();
    return res.status(201).json(agent);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const agents = await Agent.find().sort({ nombre: 1 }).limit(500);
    return res.json(agents);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agente no encontrado' });

    // traer denuncias donde está involucrado
    const denuncias = await Denuncia.find({ 'agentes.agente': agent._id })
      .populate('ciudadanos.ciudadano')
      .populate('agentes.agente');

    return res.json({ agent, denuncias });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// fichar: tipo 'inicio' o 'fin'
exports.fichar = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo = 'inicio', metodo = 'manual', notas } = req.body;
    if (!['inicio', 'fin'].includes(tipo)) return res.status(400).json({ error: 'tipo inválido' });

    const agent = await Agent.findById(id);
    if (!agent) return res.status(404).json({ error: 'Agente no encontrado' });

    agent.fichas.push({ tipo, metodo, notas, fecha: new Date() });

    // marcar activo según tipo
    if (tipo === 'inicio') agent.activo = true;
    if (tipo === 'fin') agent.activo = false;

    await agent.save();
    return res.json(agent);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.terminarServicio = async (req, res) => {
  try {
    // alias para fichar tipo 'fin'
    req.body.tipo = 'fin';
    return exports.fichar(req, res);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
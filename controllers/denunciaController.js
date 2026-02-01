const Denuncia = require('../models/Denuncia');
const DNI = require('../models/DNI');
const Agent = require('../models/Agent');
const mongoose = require('mongoose');

exports.create = async (req, res) => {
  try {
    const { titulo, descripcion, creadoPor, ciudadanos = [], agentes = [], estado } = req.body;
    if (!titulo) return res.status(400).json({ error: 'titulo requerido' });

    // validar referencias opcionalmente
    const doc = new Denuncia({ titulo, descripcion, creadoPor, ciudadanos: [], agentes: [], estado });

    // push ciudadanos (validar IDs)
    for (const c of ciudadanos) {
      // c: { ciudadano: id, rol, notas }
      doc.ciudadanos.push(c);
    }
    // push agentes
    for (const a of agentes) {
      doc.agentes.push(a);
    }

    await doc.save();
    const populated = await Denuncia.findById(doc._id)
      .populate('ciudadanos.ciudadano')
      .populate('agentes.agente');
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const denuncia = await Denuncia.findById(req.params.id)
      .populate('ciudadanos.ciudadano')
      .populate('agentes.agente');
    if (!denuncia) return res.status(404).json({ error: 'Denuncia no encontrada' });
    return res.json(denuncia);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    // filtros opcionales: estado, agente, ciudadano
    const q = {};
    if (req.query.estado) q.estado = req.query.estado;
    if (req.query.agenteId && mongoose.Types.ObjectId.isValid(req.query.agenteId)) {
      q['agentes.agente'] = req.query.agenteId;
    }
    if (req.query.ciudadanoId && mongoose.Types.ObjectId.isValid(req.query.ciudadanoId)) {
      q['ciudadanos.ciudadano'] = req.query.ciudadanoId;
    }
    const results = await Denuncia.find(q)
      .sort({ createdAt: -1 })
      .limit(200)
      .populate('ciudadanos.ciudadano')
      .populate('agentes.agente');
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.addCiudadano = async (req, res) => {
  try {
    const { id } = req.params; // denuncia id
    const { ciudadano, rol, notas } = req.body;
    if (!ciudadano || !rol) return res.status(400).json({ error: 'ciudadano y rol requeridos' });

    const denuncia = await Denuncia.findById(id);
    if (!denuncia) return res.status(404).json({ error: 'Denuncia no encontrada' });

    // opcional: validar ciudadano existe
    const persona = await DNI.findById(ciudadano);
    if (!persona) return res.status(404).json({ error: 'Ciudadano no encontrado' });

    denuncia.ciudadanos.push({ ciudadano, rol, notas });
    await denuncia.save();

    const populated = await Denuncia.findById(denuncia._id).populate('ciudadanos.ciudadano').populate('agentes.agente');
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.addAgente = async (req, res) => {
  try {
    const { id } = req.params; // denuncia id
    const { agente, rol, notas } = req.body;
    if (!agente) return res.status(400).json({ error: 'agente requerido' });

    const denuncia = await Denuncia.findById(id);
    if (!denuncia) return res.status(404).json({ error: 'Denuncia no encontrada' });

    // validar agente existe
    const aDoc = await Agent.findById(agente);
    if (!aDoc) return res.status(404).json({ error: 'Agente no encontrado' });

    denuncia.agentes.push({ agente, rol: rol || 'involucrado', notas });
    await denuncia.save();

    const populated = await Denuncia.findById(denuncia._id).populate('ciudadanos.ciudadano').populate('agentes.agente');
    return res.status(201).json(populated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    if (!['abierta', 'en_investigacion', 'cerrada'].includes(estado)) {
      return res.status(400).json({ error: 'estado inválido' });
    }
    const denuncia = await Denuncia.findById(id);
    if (!denuncia) return res.status(404).json({ error: 'Denuncia no encontrada' });
    denuncia.estado = estado;
    await denuncia.save();
    const populated = await Denuncia.findById(denuncia._id).populate('ciudadanos.ciudadano').populate('agentes.agente');
    return res.json(populated);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const DNI = require('../models/DNI');
const mongoose = require('mongoose');

// helper find user by id string (ObjectId) or discordUserId or dniNumero
async function findUser(id) {
  let user = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    user = await DNI.findById(id);
  }
  if (!user) {
    user = await DNI.findOne({ $or: [{ discordUserId: id }, { dniNumero: id }] });
  }
  return user;
}

exports.create = async (req, res) => {
  try {
    const doc = new DNI(req.body);
    await doc.save();
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.search = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'q query param requerido' });
    const regex = new RegExp(q, 'i');
    const results = await DNI.find({
      $or: [
        { nombreCompleto: regex },
        { dniNumero: regex },
        { discordUserId: regex },
        { discordTag: regex }
      ]
    }).limit(50);
    return res.json(results);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// add multa
exports.addMulta = async (req, res) => {
  try {
    const { id } = req.params;
    const motivo = (req.body.motivo ?? req.body.value ?? '').toString().trim();
    const montoRaw = req.body.monto ?? req.body.amount;
    const monto = montoRaw !== undefined && montoRaw !== '' ? Number(montoRaw) : undefined;
    const creadoPor = req.body.creadoPor ?? req.body.creador ?? '';

    if (!motivo) return res.status(400).json({ error: 'motivo requerido' });
    if (monto !== undefined && (Number.isNaN(monto) || monto < 0)) {
      return res.status(400).json({ error: 'monto inválido (debe ser número >= 0)' });
    }

    const user = await findUser(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    user.multas.push({ motivo, monto, creadoPor, fecha: new Date() });
    await user.save();

    const nuevaMulta = user.multas[user.multas.length - 1];
    return res.status(201).json({ multa: nuevaMulta, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.removeMulta = async (req, res) => {
  try {
    const { id, multaId } = req.params;
    const user = await findUser(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const idx = user.multas.findIndex(m => m._id && String(m._id) === String(multaId));
    if (idx === -1) return res.status(404).json({ error: 'Multa no encontrada' });

    user.multas.splice(idx, 1);
    await user.save();
    return res.json({ deletedId: multaId, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// antecedentes
exports.addAntecedente = async (req, res) => {
  try {
    const { id } = req.params;
    const razon = (req.body.razon ?? '').toString().trim();
    const tiempoPrision = req.body.tiempoPrision;
    const articulo = req.body.articulo;
    const creadoPor = req.body.creadoPor ?? req.body.creador ?? '';

    if (!razon) return res.status(400).json({ error: 'razon requerido' });

    const user = await findUser(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    user.antecedentes.push({ razon, tiempoPrision, articulo, creadoPor, fecha: new Date() });
    await user.save();

    const nuevo = user.antecedentes[user.antecedentes.length - 1];
    return res.status(201).json({ antecedente: nuevo, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.removeAntecedente = async (req, res) => {
  try {
    const { id, antecedenteId } = req.params;
    const user = await findUser(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const idx = user.antecedentes.findIndex(a => a._id && String(a._id) === String(antecedenteId));
    if (idx === -1) return res.status(404).json({ error: 'Antecedente no encontrado' });

    user.antecedentes.splice(idx, 1);
    await user.save();
    return res.json({ deletedId: antecedenteId, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// atestados
exports.addAtestado = async (req, res) => {
  try {
    const { id } = req.params;
    const descripcion = req.body.descripcion ?? req.body.value ?? '';
    const fileUrl = req.body.fileUrl;
    const creadoPor = req.body.creadoPor ?? req.body.creador ?? '';

    const user = await findUser(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    user.atestados.push({ descripcion, fileUrl, creadoPor, fecha: new Date() });
    await user.save();

    const nuevo = user.atestados[user.atestados.length - 1];
    return res.status(201).json({ atestado: nuevo, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.removeAtestado = async (req, res) => {
  try {
    const { id, atestadoId } = req.params;
    const user = await findUser(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const idx = user.atestados.findIndex(a => a._id && String(a._id) === String(atestadoId));
    if (idx === -1) return res.status(404).json({ error: 'Atestado no encontrado' });

    user.atestados.splice(idx, 1);
    await user.save();
    return res.json({ deletedId: atestadoId, user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// busqueda
exports.setBusqueda = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo, motivo, creadoPor } = req.body;
    const user = await findUser(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (activo) {
      user.busqueda = { activo: true, motivo, creadoPor: creadoPor ?? '', fecha: new Date() };
    } else {
      user.busqueda = { activo: false };
    }
    await user.save();
    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
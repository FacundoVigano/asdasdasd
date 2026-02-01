const { Schema, model, Types } = require('mongoose');

const CiudadanoRefSchema = new Schema({
  ciudadano: { type: Types.ObjectId, ref: 'DNI', required: true },
  rol: { type: String, enum: ['sospechoso', 'victima', 'testigo'], required: true },
  notas: { type: String }
}, { _id: false });

const AgenteRefSchema = new Schema({
  agente: { type: Types.ObjectId, ref: 'Agent', required: true },
  rol: { type: String, enum: ['involucrado', 'denunciante', 'investigador'], default: 'involucrado' },
  notas: { type: String }
}, { _id: false });

const denunciaSchema = new Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String },
  ciudadanos: { type: [CiudadanoRefSchema], default: [] },
  agentes: { type: [AgenteRefSchema], default: [] },
  estado: { type: String, enum: ['abierta', 'en_investigacion', 'cerrada'], default: 'abierta' },
  creadoPor: { type: String },
  fecha: { type: Date, default: Date.now },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true });

module.exports = model('Denuncia', denunciaSchema);
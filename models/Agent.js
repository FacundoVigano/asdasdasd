const { Schema, model } = require('mongoose');

const FichaSchema = new Schema({
  tipo: { type: String, enum: ['inicio', 'fin'], required: true },
  fecha: { type: Date, default: Date.now },
  metodo: { type: String }, // ej: 'manual', 'sistema', 'comando'
  notas: { type: String }
}, { _id: false });

const agentSchema = new Schema({
  discordUserId: { type: String }, // opcional link con DNI si aplica
  nombre: { type: String, required: true },
  placa: { type: String }, // identificador interno del agente
  rango: { type: String },
  activo: { type: Boolean, default: true },
  fichas: { type: [FichaSchema], default: [] },
  creadoPor: { type: String },
  // metadatos adicionales
  notas: { type: String }
}, { timestamps: true });

module.exports = model('Agent', agentSchema);
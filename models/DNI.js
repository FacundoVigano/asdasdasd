const { Schema, model } = require('mongoose');

const MultaSchema = new Schema({
  motivo: { type: String, required: true },
  monto: { type: Number },
  creadoPor: { type: String },
  fecha: { type: Date, default: Date.now }
}, { _id: true });

const AntecedenteSchema = new Schema({
  razon: { type: String, required: true },
  tiempoPrision: { type: String },
  articulo: { type: String },
  creadoPor: { type: String },
  fecha: { type: Date, default: Date.now }
}, { _id: true });

const AtestadoSchema = new Schema({
  descripcion: { type: String },
  fileUrl: { type: String },
  creadoPor: { type: String },
  fecha: { type: Date, default: Date.now }
}, { _id: true });

const BusquedaSchema = new Schema({
  activo: { type: Boolean, default: false },
  motivo: { type: String },
  creadoPor: { type: String },
  fecha: { type: Date, default: Date.now }
}, { _id: false });

const CarnetSchema = new Schema({
  tieneCarnet: { type: Boolean, default: false },
  categoria: { type: String },           // ej: "B", "C"
  puntos: { type: Number, default: 12 }, // puntos actuales; valor por defecto
  fechaEmision: { type: Date },
  fechaVencimiento: { type: Date }
}, { _id: false });

const dniSchema = new Schema({
  discordUserId: { type: String, required: true, unique: true },
  discordTag: { type: String },
  dniNumero: { type: String, required: true, unique: true },
  nombreCompleto: { type: String, required: true },
  fechaNacimiento: { type: String },
  nacionalidad: { type: String, required: true },
  sexo: { type: String, required: true },
  fotoRobloxUrl: { type: String },

  multas: { type: [MultaSchema], default: [] },
  busqueda: { type: BusquedaSchema, default: () => ({ activo: false }) },
  antecedentes: { type: [AntecedenteSchema], default: [] },
  atestados: { type: [AtestadoSchema], default: [] },

  // Nuevo: carnet
  carnet: { type: CarnetSchema, default: () => ({ tieneCarnet: false, puntos: 12 }) }
}, { timestamps: true });

module.exports = model('DNI', dniSchema);
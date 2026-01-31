const { Schema, model } = require('mongoose');

const authUserSchema = new Schema({
  discordId: { type: String, required: true, unique: true },
  username: { type: String },
  discriminator: { type: String },
  avatar: { type: String },
  roles: { type: [String], default: [] } // ex: ["admin","policia","medico"]
}, { timestamps: true });

module.exports = model('AuthUser', authUserSchema);
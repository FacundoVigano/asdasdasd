const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

const dniRoutes = require('./routes/dni');
const denunciaRoutes = require('./routes/denuncia');
const agentRoutes = require('./routes/agents');

const app = express();

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5000';
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Mount routes
app.use('/api/dni', dniRoutes);
app.use('/api/denuncias', denunciaRoutes);
app.use('/api/agentes', agentRoutes);

app.get('/', (req, res) => res.send('DNI API running'));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI no definido en .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Mongo conectado');
    app.listen(PORT, () => console.log(`Server en http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Error conectando a Mongo:', err);
    process.exit(1);
  });
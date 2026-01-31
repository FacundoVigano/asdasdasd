require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');

const passport = require('./config/passport'); // configura passport
const authRoutes = require('./routes/auth');
const dniRoutes = require('./routes/dni');

const app = express();

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5000';
app.use(cors({ origin: FRONTEND, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// session temporal requerido por passport (solo para el flow OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-session-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// rutas de autenticación
app.use('/auth', authRoutes);

// rutas de API (protegidas con middleware en routes/dni)
app.use('/api/dni', dniRoutes);

// health
app.get('/', (req, res) => res.send('DNI API running'));

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI no definido en .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Mongo conectado');
    app.listen(PORT, () => console.log(`Server en http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('Error conectando a Mongo:', err);
    process.exit(1);
  });
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));

app.get('/', (req, res) => {
  res.send('Job Tracker API chal rahi hai');
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Database connected');
    app.listen(5000, () => console.log('Server port 5000 pe chal raha hai'));
  })
  .catch((err) => console.log('DB error:', err.message));
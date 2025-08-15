const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/contact', (req, res) => {
  const { name, email } = req.body;
  console.log('Received contact form:', { name, email });
  // You can add logic here to save to a database, send an email, etc.
  res.json({ message: 'Form received!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
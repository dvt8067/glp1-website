import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/contact', async (req, res) => {
  const { name, email, recaptcha } = req.body;

  // Build the verification URL
  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${recaptcha}`;

  try {
    // Verify the reCAPTCHA token with Google
    const captchaRes = await fetch(verifyURL, { method: 'POST' });
    const captchaData = await captchaRes.json();

    if (!captchaData.success || captchaData.score < 0.5) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed.', score: captchaData.score });
    }

    console.log('Received contact form:', { name, email });
    res.json({ message: 'Form received and reCAPTCHA verified!' });
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    res.status(500).json({ message: 'Server error during reCAPTCHA verification.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
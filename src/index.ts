import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur demarre sur le port ${PORT}`);
  console.log(`URL: http://127.0.0.1:${PORT}`);
});

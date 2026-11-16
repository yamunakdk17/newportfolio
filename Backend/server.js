import app from './src/app.js';

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  console.log(`Portfolio API listening on http://localhost:${port}`);
});

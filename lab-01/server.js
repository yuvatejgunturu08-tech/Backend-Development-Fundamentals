const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (request, response) => {
  response.status(200).send('Welcome to my Express server!');
});

app.get('/about', (request, response) => {
  response.status(200).json({
    name: 'Gunturu Yuvatej',
    section: 'AIML 2B'
  });
});

app.get('/time', (request, response) => {
  response.status(200).send(new Date().toString());
});

// This must stay after all the routes above
app.use((request, response) => {
  response.status(404).send('404 - Page not found');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
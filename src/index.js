import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
const port = process.env.PORT || 5000;
app.set('port', port);

app.get('/', (req, res) => {
  res.send('Hello');
});

app.get('/users', (req, res) => {
  res.json([
    { id: 1, firstName: "Bob", lastName: "Smith", email: "bob@gmail.com" },
    { id: 2, firstName: "Tammy", lastName: "Norton", email: "tammy@gmail.com" },
    { id: 3, firstName: "Tina", lastName: "Lee", email: "tina@gmail.com" },
  ]);
});

app.listen(app.get('port'), () => {
  console.log("Node app is running at localhost: " + app.get('port')); // eslint-disable-line no-console
});

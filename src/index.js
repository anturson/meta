import '@babel/polyfill';
import createApp from './app';

const debug = require('debug')('app');

require('dotenv').config();

const app = createApp(process.env.MONGODB_URI);
const port = process.env.PORT;
app.listen(port, () => {
  debug("Node app is running at localhost: " + port);
});

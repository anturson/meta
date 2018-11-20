import '@babel/polyfill';
import createApp from './app';

require('dotenv').config();

const app = createApp(process.env.MONGODB_URI);

app.listen(process.env.PORT, () => {
  console.log("Node app is running at localhost: " + app.get('port')); // eslint-disable-line no-console
});

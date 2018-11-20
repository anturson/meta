import '@babel/polyfill';
import createApp from './app';

require('dotenv').config();

const app = createApp(process.env.MONGODB_URI);
const port = process.env.PORT;
app.listen(port, () => {
  console.log("Node app is running at localhost: " + port); // eslint-disable-line no-console
});

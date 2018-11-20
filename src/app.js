import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

import Entity from './entity';
import Field from './field';
import itemsRouter from './items-router';

export default (dbUri) => {
  mongoose.connect(dbUri, {
    useNewUrlParser: true,
  });

  const app = express();

  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: true, }));
  app.use(bodyParser.json());

  app.use('/api/entity', itemsRouter(Entity));
  app.use('/api/field', itemsRouter(Field));

  return app;
};

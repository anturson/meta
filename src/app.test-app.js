import '@babel/polyfill';
import createApp from './app';
import chai from 'chai';
import chaiHttp from 'chai-http';

import Entity from './entity';
import Field from './field';

chai.use(chaiHttp);

const { expect, request } = chai;

require('dotenv').config();

const app = createApp(process.env.MONGOLAB_BLACK_URI);

describe('Api', () => {
  let server;

  const entity1 = { name: 'entity1' };
  const entity2 = { name: 'entity2' };
  const entity3 = { name: 'entity3' };

  const field1 = { name: 'field1' };
  const field2 = { name: 'field2' };
  const field3 = { name: 'field3' };
  before(async () => {
    server = app.listen(process.env.PORT);

    const entities = await Entity.insertMany([
      entity1,
      entity2,
      entity3,
    ]);
    entity1.id = entities[0].id;
    entity2.id = entities[1].id;
    entity3.id = entities[2].id;

    const fields = await Field.insertMany([
      field1,
      field2,
      field3,
    ]);
    field1.id = fields[0].id;
    field2.id = fields[1].id;
    field3.id = fields[2].id;
  });

  describe('entities', () => {
    describe('get list', () => {
      it('should return entities list', async () => {
        const res = await request(app)
          .get('/api/entities')
          .set('Accept', 'application/json');

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('length', 3);
      });
    });

    describe('post item', () => {
      it('should add an entity', async () => {
        const newEntity = { name: 'newEntity' };
        const res = await request(app)
          .post('/api/entities')
          .set('Accept', 'application/json')
          .send(newEntity);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('name', newEntity.name);
        expect(res.body).to.have.property('deleted', false);
        expect(res.body).to.have.property('_id');
      });
    });

    describe('get item', () => {
      it('should return entity', async () => {
        const res = await request(app)
          .get(`/api/entities/${entity1.id}`)
          .set('Accept', 'application/json');

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('name', entity1.name);
        expect(res.body).to.have.property('deleted', false);
        expect(res.body).to.have.property('_id', entity1.id);
      });

      it('should return 404 for no item', async () => {
        const res = await request(app)
          .get(`/api/entities/123`)
          .set('Accept', 'application/json');
        expect(res.status).to.equal(404);
      });
    });

    describe('put item', () => {
      it('should replace entity', async () => {
        const res = await request(app)
          .put(`/api/entities/${entity1.id}`)
          .set('Accept', 'application/json')
          .send({ deleted: true });

        expect(res.status).to.equal(200);
        expect(res.body).not.to.have.property('name');
        expect(res.body).to.have.property('deleted', true);
        expect(res.body).to.have.property('_id', entity1.id);
      });
    });

    describe('patch item', () => {
      it('should update entity', async () => {
        const res = await request(app)
          .patch(`/api/entities/${entity2.id}`)
          .set('Accept', 'application/json')
          .send({ deleted: true });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('name', entity2.name);
        expect(res.body).to.have.property('deleted', true);
        expect(res.body).to.have.property('_id', entity2.id);
      });
    });

    describe('delete item', () => {
      it('should delete entity', async () => {
        const res = await request(app)
          .del(`/api/entities/${entity3.id}`);

        expect(res.status).to.equal(204);

        const res2 = await request(app)
          .del(`/api/entities/${entity3.id}`);

        expect(res2.status).to.equal(404);
      });
    });
  });

  after(async () => {
    await Entity.deleteMany();
    server.close();
  });
});

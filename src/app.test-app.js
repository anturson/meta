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

  before(async () => {
    server = app.listen(process.env.PORT);
  });

  testDefaultApi('entity', Entity);

  testDefaultApi('field', Field);

  describe('field specific', () => {
    let entities;
    let field;

    before(async () => {
      entities = await Entity.insertMany([
        { name: 'entity 1' },
        { name: 'entity 2' },
      ]);
      field = await Field.create({
        name: 'field 1',
        entity: entities[0].id,
        dsEntity: entities[1].id,
      });
    });

    describe('get item', () => {
      it('should not populate', async () => {
        const res = await request(app)
          .get(`/api/field/${field.id}`)
          .set('Accept', 'application/json');
        expect(res.body).to.have.property('entity', entities[0].id);
        expect(res.body).to.have.property('dsEntity', entities[1].id);
      });

      it.skip('should populate entity only', async () => {
        const res = await request(app)
          .get(`/api/field/${field.id}?populate=entity`)
          .set('Accept', 'application/json');
        expect(res.body.entity).to.have.property('name', entities[0].name);
        expect(res.body).to.have.property('dsEntity', entities[1].id);
      });

      it.skip('should populate both', async () => {
        const res = await request(app)
          .get(`/api/field/${field.id}?populate=entity,dsEntity`)
          .set('Accept', 'application/json');
        expect(res.body.entity).to.have.property('name', entities[0].name);
        expect(res.body.dsEntity).to.have.property('name', entities[1].name);
      });

      it.skip('should populate all', async () => {
        const res = await request(app)
          .get(`/api/field/${field.id}?populateAll`)
          .set('Accept', 'application/json');
        expect(res.body.entity).to.have.property('name', entities[0].name);
        expect(res.body.dsEntity).to.have.property('name', entities[1].name);
      });
    });

    describe('get list', () => {
      it('should not populate', async () => {
        const resItem = await request(app)
          .get(`/api/field`)
          .set('Accept', 'application/json');
        expect(resItem.body[0]).to.have.property('entity', entities[0].id);
        expect(resItem.body[0]).to.have.property('dsEntity', entities[1].id);
      });

      it.skip('should populate entity only', async () => {
        const resItem = await request(app)
          .get(`/api/field?populate=entity`)
          .set('Accept', 'application/json');
        expect(resItem.body[0].entity).to.have.property('name', entities[0].name);
        expect(resItem.body[0]).to.have.property('dsEntity', entities[1].id);
      });

      it.skip('should populate both', async () => {
        const resItem = await request(app)
          .get(`/api/field?populate=entity,dsEntity`)
          .set('Accept', 'application/json');
        expect(resItem.body[0].entity).to.have.property('name', entities[0].name);
        expect(resItem.body[0].dsEntity).to.have.property('name', entities[1].name);
      });

      it.skip('should populate all', async () => {
        const resItem = await request(app)
          .get(`/api/field?populateAll`)
          .set('Accept', 'application/json');
        expect(resItem.body[0].entity).to.have.property('name', entities[0].name);
        expect(resItem.body[0].dsEntity).to.have.property('name', entities[1].name);
      });
    });

    after(async () => {
      await Entity.deleteMany();
      await Field.deleteMany();
    });
  });

  after(async () => {
    server.close();
  });
});

function testDefaultApi(name, model) {
  describe(`${name} default`, () => {
    let items;
    before(async () => {
      items = await model.insertMany([
        { name: 'item 1', },
        { name: 'item 2', },
        { name: 'item 3', },
      ]);
    });
    describe('get return list', () => {
      it('should list', async () => {
        const res = await request(app)
          .get(`/api/${name}`)
          .set('Accept', 'application/json');

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('length', 3);
      });
    });

    describe('post item', () => {
      it('should add an item', async () => {
        const newItem = { name: 'newItem' };
        const res = await request(app)
          .post(`/api/${name}`)
          .set('Accept', 'application/json')
          .send(newItem);

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('name', newItem.name);
        expect(res.body).to.have.property('deleted', false);
        expect(res.body).to.have.property('_id');
      });
    });

    describe('get item', () => {
      it('should return item', async () => {
        const res = await request(app)
          .get(`/api/${name}/${items[0].id}`)
          .set('Accept', 'application/json');

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('name', items[0].name);
        expect(res.body).to.have.property('_id', items[0].id);
      });

      it('should return 404 for no item', async () => {
        const res = await request(app)
          .get(`/api/${name}/123`)
          .set('Accept', 'application/json');
        expect(res.status).to.equal(404);
      });
    });

    describe('put item', () => {
      it('should replace item', async () => {
        const res = await request(app)
          .put(`/api/${name}/${items[0].id}`)
          .set('Accept', 'application/json')
          .send({ deleted: true });

        expect(res.status).to.equal(200);
        expect(res.body).not.to.have.property('name');
        expect(res.body).to.have.property('deleted', true);
        expect(res.body).to.have.property('_id', items[0].id);
      });
    });

    describe('patch item', () => {
      it('should update item', async () => {
        const res = await request(app)
          .patch(`/api/${name}/${items[1].id}`)
          .set('Accept', 'application/json')
          .send({ deleted: true });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('name', items[1].name);
        expect(res.body).to.have.property('deleted', true);
        expect(res.body).to.have.property('_id', items[1].id);
      });
    });

    describe('delete item', () => {
      it('should delete item', async () => {
        const res = await request(app)
          .del(`/api/${name}/${items[2].id}`);

        expect(res.status).to.equal(204);

        const res2 = await request(app)
          .del(`/api/${name}/${items[2].id}`);

        expect(res2.status).to.equal(404);
      });
    });

    after(async () => {
      await model.deleteMany();
    });
  });
}

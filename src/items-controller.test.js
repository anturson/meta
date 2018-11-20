import chai from 'chai';
import spies from 'chai-spies';

import createItemsController from './items-controller';

chai.use(spies);

const { expect, spy } = chai;
const responseSandbox = spy.sandbox();
const modelSandbox = spy.sandbox();

const item = { id: '5bf0396cc1468c5ef71f1ec0' };
const newItem = { id: '5bf0396cc1468c5ef71f1ec1' };
const list = [];
const dbError = Error('Some db error');

const model = {
  throwDbError: false,
  findById: async function (id) {
    if (this.throwDbError) {
      throw dbError;
    }
    return id === item.id && item;
  },
  find: async function () {
    if (this.throwDbError) {
      throw dbError;
    }
    return list;
  },
  create: async function (item) {
    if (this.throwDbError) {
      throw dbError;
    }
    return item;
  },
  updateOne: async function () {
    if (this.throwDbError) {
      throw dbError;
    }
    return null;
  },
  replaceOne: async function () {
    if (this.throwDbError) {
      throw dbError;
    }
    return null;
  },
  deleteOne: async function () {
    if (this.throwDbError) {
      throw dbError;
    }
    return null;
  },
};
const controller = createItemsController(model);

const request = {
  params: {},
  item: null,
  body: null,
};

const response = {
  status: function () {
    return this;
  },
  json: () => { },
  send: () => { },
};

describe("Items Controller:", () => {
  beforeEach(() => {
    model.throwDbError = false;
    request.params = {};
    request.item = null;
    request.body = null;
    responseSandbox.on(response, ['status', 'json', 'send']);
    modelSandbox.on(model, ['findById', 'find', 'create', 'updateOne', 'replaceOne', 'deleteOne']);
  });

  afterEach(() => {
    responseSandbox.restore();
    modelSandbox.restore();
  })

  describe("Item middleware", () => {
    it("should set request item", async () => {
      request.params.itemId = item.id;
      await controller.itemMiddleware(request, response, () => { });
      expect(request.item).to.equal(item);
      expect(model.findById).to.have.been.called();
    });

    it("should send 404", async () => {
      request.params.itemId = newItem.id;
      await controller.itemMiddleware(request, response, () => { });
      expect(response.status).to.have.been.called.with(404);
      expect(response.send).to.have.been.called.with('Item not found');
      expect(model.findById).to.have.been.called();
    });

    it("should send 500", async () => {
      request.params.itemId = newItem.id;
      model.throwDbError = true;
      await controller.itemMiddleware(request, response, () => { });
      expect(response.status).to.have.been.called.with(500);
      expect(response.send).to.have.been.called.with(dbError);
      expect(model.findById).to.have.been.called();
    });
  });

  describe("Get list", () => {
    it("should return list json", async () => {
      await controller.getList(request, response);
      expect(response.json).to.have.been.called.with(list);
      expect(model.find).to.have.been.called();
    });

    it("should send 500", async () => {
      model.throwDbError = true;
      await controller.getList(request, response, () => { });
      expect(response.status).to.have.been.called.with(500);
      expect(response.send).to.have.been.called.with(dbError);
      expect(model.find).to.have.been.called();
    });
  });

  describe("Post item", () => {
    it("should return item created", async () => {
      request.body = newItem;
      await controller.postItem(request, response);
      expect(response.status).to.have.been.called.with(201);
      expect(response.json).to.have.been.called.with(newItem);
      expect(model.create).to.have.been.called();
    });

    it("should send 500", async () => {
      model.throwDbError = true;
      await controller.postItem(request, response);
      expect(response.status).to.have.been.called.with(500);
      expect(response.send).to.have.been.called.with(dbError);
      expect(model.create).to.have.been.called();
    });
  });

  describe("Get item", () => {
    it("should return item", async () => {
      request.item = item;
      await controller.getItem(request, response);
      expect(response.json).to.have.been.called.with(item);
    });
  });

  describe("Put item", () => {
    it("should return item", async () => {
      request.body = {};
      request.params.itemId = item.id;
      await controller.putItem(request, response);
      expect(response.json).to.have.been.called.with(item);
      expect(model.replaceOne).to.have.been.called();
    });

    it("should send 500", async () => {
      request.body = {};
      request.params.itemId = item.id;
      model.throwDbError = true;
      await controller.putItem(request, response);
      expect(response.status).to.have.been.called.with(500);
      expect(response.send).to.have.been.called.with(dbError);
      expect(model.replaceOne).to.have.been.called();
    });
  });

  describe("Patch item", () => {
    it("should return item", async () => {
      request.body = {};
      request.params.itemId = item.id;
      await controller.patchItem(request, response);
      expect(response.json).to.have.been.called.with(item);
      expect(model.updateOne).to.have.been.called();
    });

    it("should send 500", async () => {
      request.body = {};
      request.params.itemId = item.id;
      model.throwDbError = true;
      await controller.patchItem(request, response);
      expect(response.status).to.have.been.called.with(500);
      expect(response.send).to.have.been.called.with(dbError);
      expect(model.updateOne).to.have.been.called();
    });
  });

  describe("Delete item", () => {
    it("should return item removed", async () => {
      request.params.itemId = item.id;
      await controller.deleteItem(request, response);
      expect(response.status).to.have.been.called.with(204);
      expect(response.send).to.have.been.called.with('Item removed');
      expect(model.deleteOne).to.have.been.called();
    });

    it("should send 500", async () => {
      request.params.itemId = item.id;
      model.throwDbError = true;
      await controller.deleteItem(request, response);
      expect(response.status).to.have.been.called.with(500);
      expect(response.send).to.have.been.called.with(dbError);
      expect(model.deleteOne).to.have.been.called();
    });
  });

});

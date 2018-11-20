import express from 'express';
import itemsController from './items-controller';

export default (Model, controller = itemsController(Model)) => {
  const {
    getList,
    postItem,
    getItem,
    putItem,
    patchItem,
    deleteItem,
    itemMiddleware,
  } = controller;
  const router = express.Router();

  router.route('/')
    .get(getList)
    .post(postItem);

  router.use('/:itemId', itemMiddleware);

  router.route('/:itemId')
    .get(getItem)
    .put(putItem)
    .patch(patchItem)
    .delete(deleteItem);
  return router;
};

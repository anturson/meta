import mongoose from 'mongoose';

const withErrorHandling = (handle) => async (req, res, ...rest) => {
  try {
    await handle(req, res, ...rest);
  }
  catch (err) {
    res.status(500).send(err);
  }
}

export default (Model) => {
  const itemMiddleware = withErrorHandling(async (req, res, next) => {
    let item;
    if (mongoose.Types.ObjectId.isValid(req.params.itemId)) {
      item = await Model.findById(req.params.itemId);
    }
    if (!item) {
      return res.status(404).send('Item not found');
    }
    req.item = item;
    next();
  });

  const getList = withErrorHandling(async (req, res) => {
    // let dbQuery = Model.find();
    // if (req.query.populate || typeof (req.query.populateAll) !== 'undefined') {
    //   const schemaObj = Model.schema.obj;
    //   let populateProps = Object.keys(schemaObj)
    //     .filter((prop) => schemaObj[prop].type === mongoose.Types.ObjectId);
    //   if (req.query.populate) {
    //     const exactKeys = req.query.populate.split(',').map(prop => prop.trim());
    //     populateProps = populateProps.filter((prop) => exactKeys.includes(prop));
    //   }
    //   if (populateProps.length) {
    //     dbQuery = populateProps.reduce((query, prop) => query.populate(prop), dbQuery);
    //   }
    // }
    // const list = await dbQuery.exec();
    const list = await Model.find();
    res.json(list);
  });

  const postItem = withErrorHandling(async (req, res) => {
    const item = await Model.create(req.body);
    res.status(201).json(item);
  });

  const getItem = withErrorHandling(async (req, res) => {
    res.json(req.item);
  });

  const putItem = withErrorHandling(async (req, res) => {
    const {
      _id, __v, // eslint-disable-line no-unused-vars
      ...data
    } = req.body;
    await Model.replaceOne({ _id: req.params.itemId }, data);
    const item = await Model.findById(req.params.itemId);
    res.json(item);
  });

  const patchItem = withErrorHandling(async (req, res) => {
    const {
      _id, __v, // eslint-disable-line no-unused-vars
      ...data
    } = req.body;
    await Model.updateOne({ _id: req.params.itemId }, data);
    const item = await Model.findById(req.params.itemId);
    res.json(item);
  });

  const deleteItem = withErrorHandling(async (req, res) => {
    await Model.deleteOne({ _id: req.params.itemId });
    res.status(204).send('Item removed');
  });

  return {
    getList,
    postItem,
    getItem,
    putItem,
    patchItem,
    deleteItem,
    itemMiddleware,
  };
};

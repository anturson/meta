import mongoose from 'mongoose';

export default mongoose.model('Field', {
  name: String,
  entity: {
    type: mongoose.Types.ObjectId,
    ref: 'Entity',
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

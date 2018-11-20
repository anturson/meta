import mongoose from 'mongoose';

export default mongoose.model('field', {
  name: String,
  entity: {
    type: mongoose.Types.ObjectId,
    ref: 'entity',
  },
  dsEntity: {
    type: mongoose.Types.ObjectId,
    ref: 'entity',
  },
  deleted: {
    type: Boolean,
    default: false,
  },
});

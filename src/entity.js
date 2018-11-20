import mongoose from 'mongoose';

export default mongoose.model('Entity', {
  name: String,
  deleted: {
    type: Boolean,
    default: false,
  },
});

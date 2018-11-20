import mongoose from 'mongoose';

export default mongoose.model('entity', {
  name: String,
  deleted: {
    type: Boolean,
    default: false,
  },
});

// const mongoose = require('mongoose');

// const sessionSchema = new mongoose.Schema({
//   user_id: {
//     type: String, required: true  },
//   image_name: {
//     type: String, required: true  },
//   container_id: {
//     type: String, required: true  },
//   status: {
//     type: String, enum: ['RUNNING', 'STOPPED'], default: 'RUNNING'  },
//   created_at: {
//     type: Date, default: Date.now  },
//   last_active_at: {
//     type: Date, default: Date.now  },
//   resources: {
//     type: Object, default: {}  }
// });

// module.exports = mongoose.model('Session', sessionSchema);


const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user_id: {
    type: String, required: true
  },
  image_name: {
    type: String, required: true
  },
  container_id: {
    type: String, default: null  // Make it optional until the container is run
  },
  status: {
    type: String, enum: ['BUILT', 'RUNNING', 'STOPPED'], default: 'BUILT'  // Add 'BUILT' status
  },
  image_build_status: {
    type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' // Track the build status
  },
  created_at: {
    type: Date, default: Date.now
  },
  last_active_at: {
    type: Date, default: Date.now
  },
  resources: {
    type: Object, default: {}  // Store CPU, memory, etc. details
  }
});

module.exports = mongoose.model('Session', sessionSchema);
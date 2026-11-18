const mongoose = require('mongoose');
const { getIsConnected } = require('../config/db');
const { MemoryRefreshToken } = require('../config/memoryDb');

const refreshTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    revoked: {
      type: Boolean,
      default: false,
    },
    replacedByToken: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: '',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const MongooseRefreshToken =
  mongoose.models.RefreshToken || mongoose.model('RefreshToken', refreshTokenSchema);

const RefreshTokenProxy = new Proxy(MongooseRefreshToken, {
  get(target, prop) {
    if (!getIsConnected()) {
      if (prop in MemoryRefreshToken) {
        return MemoryRefreshToken[prop];
      }
    }
    return target[prop];
  },
});

module.exports = RefreshTokenProxy;

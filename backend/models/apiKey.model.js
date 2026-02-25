import { Schema, model } from 'mongoose';

const apiKeySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'UserSchema', required: true },
    name: { type: String, required: true, trim: true },
    keyHash: { type: String, required: true }, // SHA-256 hash for verification
    keyPrefix: { type: String, default: 'dl_live_' },
    keySuffix: { type: String, required: true }, // last 5 chars for masked display
    status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  },
  { timestamps: true }
);

apiKeySchema.index({ userId: 1, status: 1 });

export const ApiKey = model('ApiKey', apiKeySchema, 'apikeys');

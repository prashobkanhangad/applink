import { Schema, model } from 'mongoose';

const affiliateSignupSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    website: { type: String, default: '' },
    message: { type: String, default: '' },
  },
  { timestamps: true }
);

export const AffiliateSignup = model('AffiliateSignup', affiliateSignupSchema, 'affiliate_signups');

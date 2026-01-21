import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  email: String,         
  passwordHash: {type: String, default: null},
  authProvider: {type: String, enum: ["normal", "google", "facebook"]},
  status: {type: String, enum: ["active", "disabled"], default: "active"},
  role: {type: String, enum: ["user", "admin","sub_user"], default: "user"},
  image_url: {type: String, default: null},
  username: {type: String, unique: true, sparse: true, default: null},
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: {type: Date, default: null},
}, { timestamps: true });

export const User = model("UserSchema", UserSchema, "users")


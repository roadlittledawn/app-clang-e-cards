import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  role: "admin" | "user";
  provider: "google" | "credentials";
  passwordHash?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    image: { type: String },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    provider: { type: String, enum: ["google", "credentials"], required: true },
    passwordHash: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);

export default User;

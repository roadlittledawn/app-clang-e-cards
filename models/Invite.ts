import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IInvite extends Document {
  email: string;
  token: string;
  status: "pending" | "accepted";
  acceptedBy?: Types.ObjectId;
  createdAt: Date;
  acceptedAt?: Date;
}

const InviteSchema = new Schema<IInvite>(
  {
    email: { type: String, required: true, lowercase: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ["pending", "accepted"], default: "pending" },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },
    createdAt: { type: Date, default: Date.now },
    acceptedAt: { type: Date },
  },
  { timestamps: false }
);

InviteSchema.index({ email: 1 });

const Invite: Model<IInvite> =
  mongoose.models.Invite ?? mongoose.model<IInvite>("Invite", InviteSchema);

export default Invite;

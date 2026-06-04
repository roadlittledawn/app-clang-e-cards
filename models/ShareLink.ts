import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IShareLink extends Document {
  cardId: Types.ObjectId;
  token: string;
  expiresAt: Date | null;
  createdAt: Date;
}

const ShareLinkSchema = new Schema<IShareLink>(
  {
    cardId: { type: Schema.Types.ObjectId, ref: "Card", required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ShareLinkSchema.index({ cardId: 1 });
ShareLinkSchema.index({ expiresAt: 1 }, { sparse: true });

const ShareLink: Model<IShareLink> =
  mongoose.models.ShareLink ??
  mongoose.model<IShareLink>("ShareLink", ShareLinkSchema);

export default ShareLink;

import mongoose, { Schema, Document, Model, Types } from "mongoose";

export type ImageMode = "upload" | "giphy" | "meme";
export type EffectType = "confetti" | "balloons" | "leaves";
export type TemplateType = "standard";

export interface ICardImage {
  mode: ImageMode;
  imageId?: Types.ObjectId;
  giphyUrl?: string;
  s3Key?: string;
}

export interface ICard extends Document {
  userId: Types.ObjectId;
  templateType: TemplateType;
  title: string;
  message: string;
  recipientName: string;
  image?: ICardImage;
  effect?: EffectType;
  createdAt: Date;
  updatedAt: Date;
}

const CardImageSchema = new Schema<ICardImage>(
  {
    mode: { type: String, enum: ["upload", "giphy", "meme"], required: true },
    imageId: { type: Schema.Types.ObjectId, ref: "Image" },
    giphyUrl: { type: String },
    s3Key: { type: String },
  },
  { _id: false }
);

const CardSchema = new Schema<ICard>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    templateType: { type: String, enum: ["standard"], default: "standard" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipientName: { type: String, required: true },
    image: { type: CardImageSchema },
    effect: { type: String, enum: ["confetti", "balloons", "leaves"] },
  },
  { timestamps: true }
);

CardSchema.index({ userId: 1, createdAt: -1 });

const Card: Model<ICard> =
  mongoose.models.Card ?? mongoose.model<ICard>("Card", CardSchema);

export default Card;

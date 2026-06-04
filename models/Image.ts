import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IImage extends Document {
  userId: Types.ObjectId;
  s3Key: string;
  filename: string;
  size: number;
  mimeType: string;
  createdAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    s3Key: { type: String, required: true },
    filename: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ImageSchema.index({ userId: 1, createdAt: -1 });

const Image: Model<IImage> =
  mongoose.models.Image ?? mongoose.model<IImage>("Image", ImageSchema);

export default Image;

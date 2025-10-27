import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerProfile extends Document {
  userId: mongoose.Types.ObjectId;
  displayName: string;
  level: number;
  experience: number;
  softCurrency: number;
  premiumCurrency: number;
  createdAt: Date;
  updatedAt: Date;
}

const PlayerProfileSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    softCurrency: {
      type: Number,
      default: 0,
      min: 0,
    },
    premiumCurrency: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

PlayerProfileSchema.index({ userId: 1 });

export default mongoose.model<IPlayerProfile>('PlayerProfile', PlayerProfileSchema);

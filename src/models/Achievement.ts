import mongoose, { Schema, Document } from 'mongoose';

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievements: {
    achievementId: string;
    name: string;
    description: string;
    category: string;
    progress: number;
    maxProgress: number;
    unlocked: boolean;
    unlockedAt?: Date;
    rewards?: {
      softCurrency?: number;
      premiumCurrency?: number;
      items?: string[];
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    achievements: [
      {
        achievementId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        category: {
          type: String,
          required: true,
        },
        progress: {
          type: Number,
          default: 0,
          min: 0,
        },
        maxProgress: {
          type: Number,
          required: true,
          min: 1,
        },
        unlocked: {
          type: Boolean,
          default: false,
        },
        unlockedAt: Date,
        rewards: {
          softCurrency: Number,
          premiumCurrency: Number,
          items: [String],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

AchievementSchema.index({ userId: 1 });
AchievementSchema.index({ 'achievements.achievementId': 1 });

export default mongoose.model<IAchievement>('Achievement', AchievementSchema);

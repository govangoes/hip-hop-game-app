import mongoose, { Schema, Document } from 'mongoose';

export interface ICollection extends Document {
  userId: mongoose.Types.ObjectId;
  cards: {
    cardId: string;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    era: string;
    artist?: string;
    quantity: number;
    acquiredAt: Date;
  }[];
  stickers: {
    stickerId: string;
    name: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    category: string;
    quantity: number;
    acquiredAt: Date;
  }[];
  albums: {
    albumId: string;
    name: string;
    totalCards: number;
    collectedCards: number;
    completed: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    cards: [
      {
        cardId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rarity: {
          type: String,
          enum: ['common', 'rare', 'epic', 'legendary'],
          required: true,
        },
        era: {
          type: String,
          required: true,
        },
        artist: String,
        quantity: {
          type: Number,
          default: 1,
          min: 0,
        },
        acquiredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    stickers: [
      {
        stickerId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rarity: {
          type: String,
          enum: ['common', 'rare', 'epic', 'legendary'],
          required: true,
        },
        category: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: 0,
        },
        acquiredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    albums: [
      {
        albumId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        totalCards: {
          type: Number,
          required: true,
          min: 0,
        },
        collectedCards: {
          type: Number,
          default: 0,
          min: 0,
        },
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

CollectionSchema.index({ userId: 1 });
CollectionSchema.index({ 'cards.cardId': 1 });
CollectionSchema.index({ 'stickers.stickerId': 1 });

export default mongoose.model<ICollection>('Collection', CollectionSchema);

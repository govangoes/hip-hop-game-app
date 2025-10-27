import mongoose, { Schema, Document } from 'mongoose';

export interface ICityState extends Document {
  userId: mongoose.Types.ObjectId;
  cityName: string;
  cityLevel: number;
  buildings: {
    buildingId: string;
    buildingType: string;
    position: {
      x: number;
      y: number;
    };
    level: number;
    isUpgrading: boolean;
    upgradeCompleteAt?: Date;
  }[];
  neighborhoods: {
    neighborhoodId: string;
    name: string;
    era: string;
    unlocked: boolean;
  }[];
  lastSaved: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CityStateSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    cityName: {
      type: String,
      required: true,
      trim: true,
    },
    cityLevel: {
      type: Number,
      default: 1,
      min: 1,
    },
    buildings: [
      {
        buildingId: {
          type: String,
          required: true,
        },
        buildingType: {
          type: String,
          required: true,
        },
        position: {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
        },
        level: {
          type: Number,
          default: 1,
          min: 1,
        },
        isUpgrading: {
          type: Boolean,
          default: false,
        },
        upgradeCompleteAt: Date,
      },
    ],
    neighborhoods: [
      {
        neighborhoodId: {
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        era: {
          type: String,
          required: true,
        },
        unlocked: {
          type: Boolean,
          default: false,
        },
      },
    ],
    lastSaved: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

CityStateSchema.index({ userId: 1 });

export default mongoose.model<ICityState>('CityState', CityStateSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email?: string;
  password?: string;
  username: string;
  isGuest: boolean;
  socialLogins?: {
    provider: 'google' | 'facebook' | 'apple';
    providerId: string;
  }[];
  devices: {
    deviceId: string;
    deviceName: string;
    lastLogin: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't include password by default in queries
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    socialLogins: [
      {
        provider: {
          type: String,
          enum: ['google', 'facebook', 'apple'],
        },
        providerId: {
          type: String,
        },
      },
    ],
    devices: [
      {
        deviceId: {
          type: String,
          required: true,
        },
        deviceName: {
          type: String,
          required: true,
        },
        lastLogin: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
UserSchema.index({ email: 1 });
UserSchema.index({ 'socialLogins.providerId': 1 });
UserSchema.index({ 'devices.deviceId': 1 });

export default mongoose.model<IUser>('User', UserSchema);

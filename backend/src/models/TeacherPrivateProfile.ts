import mongoose, { Schema, Document } from 'mongoose';

export interface IVerificationDoc {
  url: string;
  publicId: string;
  docType: string;
  uploadedAt: Date;
}

export interface ITeacherPrivateProfile extends Document {
  userId: mongoose.Types.ObjectId;
  whatsapp?: string;
  alternatePhone?: string;
  fullAddress?: string;
  verificationDocs: IVerificationDoc[];
  createdAt: Date;
  updatedAt: Date;
}

const VerificationDocSchema = new Schema<IVerificationDoc>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    docType: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const TeacherPrivateProfileSchema = new Schema<ITeacherPrivateProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    whatsapp: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    fullAddress: { type: String, trim: true },
    verificationDocs: { type: [VerificationDocSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const TeacherPrivateProfile = mongoose.model<ITeacherPrivateProfile>(
  'TeacherPrivateProfile',
  TeacherPrivateProfileSchema
);

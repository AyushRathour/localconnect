export type UserRole = 'customer' | 'provider' | 'admin';
export type AccountStatus = 'active' | 'suspended';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: UserRole;
  profileImage?: string;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type VerificationStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected' | 'resubmission_required';

export interface IProviderProfile {
  _id: string;
  userId: string;
  businessName: string;
  description: string;
  skills: string[];
  experienceYears: number;
  serviceAreas: string[];
  profileImage?: string;
  verificationStatus: VerificationStatus;
  verificationFeedback?: string;
  verificationSubmittedAt?: string;
  verificationReviewedAt?: string;
  approvedAt?: string;
  averageRating: number;
  reviewCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IVerificationDocument {
  _id: string;
  providerId: string;
  documentType: 'id_proof' | 'trade_license' | 'business_registration' | 'certifications';
  documentName: string;
  documentUrl?: string; // Stored securely, never returned in public APIs
  secureStorageKey: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  feedback?: string;
}

export interface IServiceCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  image?: string;
  active: boolean;
  serviceCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type PricingType = 'fixed' | 'hourly' | 'starting_at';

export interface IService {
  _id: string;
  providerId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  pricingType: PricingType;
  estimatedDuration: string;
  serviceAreas: string[];
  images: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAddress {
  _id: string;
  userId: string;
  label: 'Home' | 'Work' | 'Other';
  addressLine: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAvailability {
  _id: string;
  providerId: string;
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  availabilityStatus: 'active' | 'unavailable';
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface IBookingStatusHistory {
  status: BookingStatus;
  changedBy: string;
  note?: string;
  timestamp: string;
}

export interface IBooking {
  _id: string;
  bookingReference: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  addressSnapshot: {
    label: string;
    addressLine: string;
    area: string;
    city: string;
    state: string;
    postalCode: string;
  };
  requestedDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  servicePriceSnapshot: number;
  pricingTypeSnapshot: PricingType;
  additionalCharges: number;
  totalAmount: number;
  customerNotes?: string;
  status: BookingStatus;
  statusHistory: IBookingStatusHistory[];
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number; // 1 to 5
  comment: string;
  moderationStatus: 'approved' | 'flagged' | 'hidden';
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'verification' | 'review' | 'system';
  relatedEntityId?: string;
  readAt?: string;
  createdAt: string;
}

export interface IContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface IAuditLog {
  _id: string;
  actorId: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  safeMetadata?: Record<string, any>;
  createdAt: string;
}

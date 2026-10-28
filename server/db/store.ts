import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  IUser,
  IProviderProfile,
  IVerificationDocument,
  IServiceCategory,
  IService,
  IAddress,
  IAvailability,
  IBooking,
  IReview,
  INotification,
  IContactMessage,
  IAuditLog,
} from './types';

export interface IDatabaseSchema {
  users: IUser[];
  providerProfiles: IProviderProfile[];
  verificationDocuments: IVerificationDocument[];
  categories: IServiceCategory[];
  services: IService[];
  addresses: IAddress[];
  availabilities: IAvailability[];
  bookings: IBooking[];
  reviews: IReview[];
  notifications: INotification[];
  contactMessages: IContactMessage[];
  auditLogs: IAuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class DocumentCollection<T extends { _id: string; createdAt?: string; updatedAt?: string }> {
  private collectionName: keyof IDatabaseSchema;
  private db: LocalConnectDatabase;

  constructor(collectionName: keyof IDatabaseSchema, db: LocalConnectDatabase) {
    this.collectionName = collectionName;
    this.db = db;
  }

  private get items(): T[] {
    return (this.db.data[this.collectionName] as unknown as T[]) || [];
  }

  private set items(newItems: T[]) {
    (this.db.data[this.collectionName] as any) = newItems;
    this.db.save();
  }

  public find(filter?: Partial<Record<keyof T, any>> | ((item: T) => boolean)): T[] {
    if (!filter) return [...this.items];
    if (typeof filter === 'function') {
      return this.items.filter(filter);
    }
    return this.items.filter((item) => {
      for (const key of Object.keys(filter) as (keyof T)[]) {
        const expected = filter[key];
        const actual = item[key];
        if (expected !== undefined && expected !== actual) {
          if (Array.isArray(actual) && !Array.isArray(expected)) {
            if (!actual.includes(expected)) return false;
          } else {
            return false;
          }
        }
      }
      return true;
    });
  }

  public findOne(filter: Partial<Record<keyof T, any>> | ((item: T) => boolean)): T | null {
    const results = this.find(filter);
    return results.length > 0 ? { ...results[0] } : null;
  }

  public findById(id: string): T | null {
    const item = this.items.find((i) => i._id === id);
    return item ? { ...item } : null;
  }

  public create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & Partial<Pick<T, '_id' | 'createdAt' | 'updatedAt'>>): T {
    const now = new Date().toISOString();
    const doc = {
      ...data,
      _id: data._id || crypto.randomUUID(),
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    } as unknown as T;

    const current = [...this.items];
    current.push(doc);
    this.items = current;
    return { ...doc };
  }

  public findByIdAndUpdate(id: string, updates: Partial<T>): T | null {
    const index = this.items.findIndex((i) => i._id === id);
    if (index === -1) return null;

    const existing = this.items[index];
    const updated = {
      ...existing,
      ...updates,
      _id: id,
      updatedAt: new Date().toISOString(),
    };

    const current = [...this.items];
    current[index] = updated;
    this.items = current;
    return { ...updated };
  }

  public findByIdAndDelete(id: string): boolean {
    const index = this.items.findIndex((i) => i._id === id);
    if (index === -1) return false;

    const current = [...this.items];
    current.splice(index, 1);
    this.items = current;
    return true;
  }

  public count(filter?: Partial<Record<keyof T, any>> | ((item: T) => boolean)): number {
    return this.find(filter).length;
  }
}

export class LocalConnectDatabase {
  public data: IDatabaseSchema = {
    users: [],
    providerProfiles: [],
    verificationDocuments: [],
    categories: [],
    services: [],
    addresses: [],
    availabilities: [],
    bookings: [],
    reviews: [],
    notifications: [],
    contactMessages: [],
    auditLogs: [],
  };

  public users = new DocumentCollection<IUser>('users', this);
  public providerProfiles = new DocumentCollection<IProviderProfile>('providerProfiles', this);
  public verificationDocuments = new DocumentCollection<IVerificationDocument>('verificationDocuments', this);
  public categories = new DocumentCollection<IServiceCategory>('categories', this);
  public services = new DocumentCollection<IService>('services', this);
  public addresses = new DocumentCollection<IAddress>('addresses', this);
  public availabilities = new DocumentCollection<IAvailability>('availabilities', this);
  public bookings = new DocumentCollection<IBooking>('bookings', this);
  public reviews = new DocumentCollection<IReview>('reviews', this);
  public notifications = new DocumentCollection<INotification>('notifications', this);
  public contactMessages = new DocumentCollection<IContactMessage>('contactMessages', this);
  public auditLogs = new DocumentCollection<IAuditLog>('auditLogs', this);

  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } else {
        this.saveSync();
      }
    } catch (err) {
      console.error('[DB] Failed to load database file, using memory state:', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveSync();
    }, 100);
  }

  public saveSync() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Failed to save database to disk:', err);
    }
  }

  public clearAll() {
    this.data = {
      users: [],
      providerProfiles: [],
      verificationDocuments: [],
      categories: [],
      services: [],
      addresses: [],
      availabilities: [],
      bookings: [],
      reviews: [],
      notifications: [],
      contactMessages: [],
      auditLogs: [],
    };
    this.saveSync();
  }
}

export const db = new LocalConnectDatabase();

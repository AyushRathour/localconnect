// Client-side fallback database for static deployments (e.g. GitHub Pages)

export interface StaticDB {
  users: any[];
  providerProfiles: any[];
  categories: any[];
  services: any[];
  addresses: any[];
  bookings: any[];
  reviews: any[];
  verificationDocuments: any[];
  auditLogs: any[];
}

const SEED_CATEGORIES = [
  {
    _id: 'cat_electrician',
    name: 'Electrician',
    slug: 'electrician',
    description: 'Certified electrical repairs, wiring, switches, and appliance installations.',
    icon: 'Zap',
    active: true,
    serviceCount: 4,
  },
  {
    _id: 'cat_plumber',
    name: 'Plumber',
    slug: 'plumber',
    description: 'Leak fixes, pipe replacements, bathroom fittings, and drain clearance.',
    icon: 'Wrench',
    active: true,
    serviceCount: 4,
  },
  {
    _id: 'cat_cleaning',
    name: 'Home Cleaning',
    slug: 'home-cleaning',
    description: 'Deep residential cleaning, kitchen & bathroom sanitization, and upholstery wash.',
    icon: 'Sparkles',
    active: true,
    serviceCount: 3,
  },
  {
    _id: 'cat_carpenter',
    name: 'Carpenter',
    slug: 'carpenter',
    description: 'Custom furniture repair, door lock installation, hinge fixes, and cabinetry.',
    icon: 'Hammer',
    active: true,
    serviceCount: 3,
  },
  {
    _id: 'cat_acrepair',
    name: 'AC Repair',
    slug: 'ac-repair',
    description: 'Air conditioning servicing, filter jet cleaning, gas charging, and installation.',
    icon: 'Wind',
    active: true,
    serviceCount: 3,
  },
  {
    _id: 'cat_painting',
    name: 'Painting',
    slug: 'painting',
    description: 'Interior wall painting, texture finish, moisture damp-proofing, and touch-ups.',
    icon: 'Paintbrush',
    active: true,
    serviceCount: 2,
  },
  {
    _id: 'cat_appliance',
    name: 'Appliance Repair',
    slug: 'appliance-repair',
    description: 'Diagnostics and repair for refrigerators, washing machines, and microwave ovens.',
    icon: 'Cpu',
    active: true,
    serviceCount: 2,
  },
  {
    _id: 'cat_tutoring',
    name: 'Home Tutoring',
    slug: 'tutoring',
    description: 'Qualified in-home academic tutors for STEM subjects, languages, and test prep.',
    icon: 'GraduationCap',
    active: true,
    serviceCount: 2,
  },
];

const SEED_USERS = [
  {
    _id: 'user_admin_01',
    name: 'System Administrator',
    email: 'admin@localconnect.com',
    phone: '+91 99999 00000',
    role: 'admin',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    _id: 'user_cust_01',
    name: 'Priya Sharma',
    email: 'customer@localconnect.com',
    phone: '+91 98765 43210',
    role: 'customer',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    _id: 'user_prov_01',
    name: 'Arun Patel',
    email: 'electrician.arun@localconnect.com',
    phone: '+91 98111 22334',
    role: 'provider',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    _id: 'user_prov_02',
    name: 'Rajesh Kumar',
    email: 'plumber.rajesh@localconnect.com',
    phone: '+91 98222 33445',
    role: 'provider',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    _id: 'user_prov_03',
    name: 'Anita Desai',
    email: 'cleaner.anita@localconnect.com',
    phone: '+91 98333 44556',
    role: 'provider',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    _id: 'user_prov_04',
    name: 'Farhan Khan',
    email: 'acrepair.farhan@localconnect.com',
    phone: '+91 98444 55667',
    role: 'provider',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
  {
    _id: 'user_prov_05',
    name: 'Vikram Singh',
    email: 'vikram.verif@localconnect.com',
    phone: '+91 98555 66778',
    role: 'provider',
    accountStatus: 'active',
    emailVerified: true,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
  },
];

const SEED_PROFILES = [
  {
    _id: 'prof_prov_01',
    userId: 'user_prov_01',
    businessName: 'Apex Electricals & Smart Wiring',
    description: 'Certified master electrician with over 8 years of experience. Specializing in circuit breaker diagnostics, smart lighting automation, and quick short-circuit triage.',
    skills: ['Circuit Breaker Diagnostics', 'Inverter Installation', 'Switchboard Repair', 'Smart Home Wiring'],
    experienceYears: 8,
    serviceAreas: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Domlur'],
    verificationStatus: 'approved',
    verificationSubmittedAt: '2026-08-01T10:00:00Z',
    verificationReviewedAt: '2026-08-02T14:30:00Z',
    approvedAt: '2026-08-02T14:30:00Z',
    averageRating: 4.9,
    reviewCount: 28,
    active: true,
  },
  {
    _id: 'prof_prov_02',
    userId: 'user_prov_02',
    businessName: 'FlowTech Plumbing Solutions',
    description: 'Professional plumbing services with high-precision pressure testing, bathroom sanitaryware fitting, drain clearing, and leak-proof guarantee.',
    skills: ['Pipe Leak Repair', 'Bathroom Fixtures', 'Drainage Unclogging', 'Water Tank Cleaning'],
    experienceYears: 6,
    serviceAreas: ['Whitefield', 'Marathahalli', 'Bellandur', 'HSR Layout'],
    verificationStatus: 'approved',
    verificationSubmittedAt: '2026-08-05T09:15:00Z',
    verificationReviewedAt: '2026-08-06T11:00:00Z',
    approvedAt: '2026-08-06T11:00:00Z',
    averageRating: 4.8,
    reviewCount: 19,
    active: true,
  },
  {
    _id: 'prof_prov_03',
    userId: 'user_prov_03',
    businessName: 'SparkleClean Deep Cleaning',
    description: 'Eco-friendly deep cleaning specialists using non-toxic disinfectants and industrial steam vacuums. Providing spotless residential sanitization.',
    skills: ['Full House Deep Clean', 'Kitchen Degreasing', 'Bathroom Steam Wash', 'Sofa Fabric Care'],
    experienceYears: 5,
    serviceAreas: ['Koramangala', 'Jayanagar', 'JP Nagar', 'Indiranagar'],
    verificationStatus: 'approved',
    verificationSubmittedAt: '2026-08-10T12:00:00Z',
    verificationReviewedAt: '2026-08-11T16:00:00Z',
    approvedAt: '2026-08-11T16:00:00Z',
    averageRating: 4.9,
    reviewCount: 34,
    active: true,
  },
  {
    _id: 'prof_prov_04',
    userId: 'user_prov_04',
    businessName: 'CoolBreeze Air Conditioning',
    description: 'Certified HVAC technicians specializing in high-efficiency split AC cleaning, chemical foam coil washing, gas replenishment, and PCB troubleshooting.',
    skills: ['Split AC Jet Service', 'Gas Charging & Leak Test', 'PCB Circuit Repair', 'AC Uninstallation & Re-fit'],
    experienceYears: 7,
    serviceAreas: ['Indiranagar', 'HSR Layout', 'Koramangala', 'Whitefield'],
    verificationStatus: 'approved',
    verificationSubmittedAt: '2026-08-12T10:00:00Z',
    verificationReviewedAt: '2026-08-13T12:00:00Z',
    approvedAt: '2026-08-13T12:00:00Z',
    averageRating: 4.7,
    reviewCount: 15,
    active: true,
  },
  {
    _id: 'prof_prov_05',
    userId: 'user_prov_05',
    businessName: 'Singh Wooden Crafts',
    description: 'Woodworking artisan with custom carpentry experience. Application pending administrative review.',
    skills: ['Furniture Assembly', 'Door Locks', 'Cabinetry Repair'],
    experienceYears: 4,
    serviceAreas: ['Indiranagar', 'Domlur'],
    verificationStatus: 'pending',
    verificationSubmittedAt: '2026-08-20T10:00:00Z',
    averageRating: 0,
    reviewCount: 0,
    active: true,
  },
];

const SEED_SERVICES = [
  {
    _id: 'srv_01',
    providerId: 'prof_prov_01',
    categoryId: 'cat_electrician',
    title: 'Emergency Short Circuit Diagnostics & Repair',
    description: 'Comprehensive electrical triage including thermal scanning of distribution boxes, blown fuse replacement, and spark hazard resolution.',
    priceType: 'fixed',
    price: 499,
    durationMinutes: 60,
    serviceArea: 'Indiranagar',
    includedItems: ['Thermal fuse scanning', 'Switchboard wire tightening', 'Safety breaker test', '30-day service warranty'],
    excludedItems: ['New MCB hardware purchase', 'Wall trenching for hidden conduits'],
    isFeatured: true,
    active: true,
  },
  {
    _id: 'srv_02',
    providerId: 'prof_prov_01',
    categoryId: 'cat_electrician',
    title: 'Complete Home Inverter & UPS Installation',
    description: 'Heavy-duty dual inverter cabling with dedicated earthing and load balancing for seamless power backup during grid outages.',
    priceType: 'fixed',
    price: 1499,
    durationMinutes: 120,
    serviceArea: 'Indiranagar',
    includedItems: ['Inverter battery terminal setup', 'Main line bypass switch installation', 'Earthing leakage check'],
    excludedItems: ['Inverter and battery cost'],
    isFeatured: false,
    active: true,
  },
  {
    _id: 'srv_03',
    providerId: 'prof_prov_02',
    categoryId: 'cat_plumber',
    title: 'Emergency Concealed Pipe Leak Triage',
    description: 'Acoustic leak detection and fast hydraulic repair for internal wall seepages, leaking bib-cocks, and kitchen sink traps.',
    priceType: 'fixed',
    price: 399,
    durationMinutes: 45,
    serviceArea: 'Whitefield',
    includedItems: ['Acoustic leak test', 'Teflon tape seal replacement', 'Drain valve tightening'],
    excludedItems: ['Tile cutting and masonry restoration'],
    isFeatured: true,
    active: true,
  },
  {
    _id: 'srv_04',
    providerId: 'prof_prov_02',
    categoryId: 'cat_plumber',
    title: 'Premium Sanitaryware & Shower Mixer Installation',
    description: 'Flawless fitting of diverters, concealed wall mixers, overhead rain showers, and dual-flush commodes with zero drips.',
    priceType: 'fixed',
    price: 899,
    durationMinutes: 90,
    serviceArea: 'Whitefield',
    includedItems: ['Pressure alignment', 'Silicone bead sealing', '30-day drip guarantee'],
    excludedItems: ['Chrome fixtures supply'],
    isFeatured: false,
    active: true,
  },
  {
    _id: 'srv_05',
    providerId: 'prof_prov_03',
    categoryId: 'cat_cleaning',
    title: 'Full Home Deep Sanitization & Steam Vacuum',
    description: 'Hospital-grade steam sanitation for 2BHK/3BHK residences. Includes high-pressure floor scrubbing, window track cleaning, and dustmite removal.',
    priceType: 'fixed',
    price: 2499,
    durationMinutes: 240,
    serviceArea: 'Koramangala',
    includedItems: ['Single-disc machine floor scrub', 'Bathroom limescale removal', 'Window track vacuuming', 'Anti-bacterial mist spray'],
    excludedItems: ['Exterior balcony pressure wash'],
    isFeatured: true,
    active: true,
  },
  {
    _id: 'srv_06',
    providerId: 'prof_prov_03',
    categoryId: 'cat_cleaning',
    title: 'Modular Kitchen Heavy Degreasing Service',
    description: 'Intense chemical degreasing of chimney filters, stainless steel racks, oil-stained tiles, and under-counter cabinetry.',
    priceType: 'fixed',
    price: 1299,
    durationMinutes: 120,
    serviceArea: 'Koramangala',
    includedItems: ['Chimney baffle filter soak', 'Countertop oil stain scrub', 'Tile grout restoration'],
    excludedItems: ['Chimney motor replacement'],
    isFeatured: false,
    active: true,
  },
  {
    _id: 'srv_07',
    providerId: 'prof_prov_04',
    categoryId: 'cat_acrepair',
    title: 'Split AC High-Pressure Jet Service & Foam Wash',
    description: 'Thorough indoor blower fan jet wash with chemical disinfectant, outdoor condenser coil rinse, and cooling temperature test.',
    priceType: 'fixed',
    price: 799,
    durationMinutes: 60,
    serviceArea: 'Indiranagar',
    includedItems: ['Indoor coil jet cleaning with spill jacket', 'Condenser fan wash', 'Drain pipe flushing', 'Filter sanitization'],
    excludedItems: ['Refrigerant gas replenishment'],
    isFeatured: true,
    active: true,
  },
  {
    _id: 'srv_08',
    providerId: 'prof_prov_04',
    categoryId: 'cat_acrepair',
    title: 'AC Gas Charging & Refrigerant Leak Triage',
    description: 'Nitrogen pressure testing, vacuum extraction of air bubbles, and precision R32/R410A gas charging with digital gauge calibration.',
    priceType: 'fixed',
    price: 1899,
    durationMinutes: 90,
    serviceArea: 'Indiranagar',
    includedItems: ['Nitrogen leak test', 'Vacuum dehydration cycle', 'Original refrigerant refill', 'Cooling drop check'],
    excludedItems: ['Compressor replacement'],
    isFeatured: false,
    active: true,
  },
];

const SEED_ADDRESSES = [
  {
    _id: 'addr_01',
    userId: 'user_cust_01',
    label: 'Home',
    addressLine: 'Flat 402, Green Glen Palms, 14th Main',
    area: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    isDefault: true,
  },
];

const SEED_BOOKINGS = [
  {
    _id: 'book_01',
    bookingNumber: 'LC-2026-8812',
    customerId: 'user_cust_01',
    providerId: 'prof_prov_01',
    serviceId: 'srv_01',
    serviceTitle: 'Emergency Short Circuit Diagnostics & Repair',
    bookingDate: '2026-11-05',
    timeSlot: '10:00 AM - 12:00 PM',
    address: {
      addressLine: 'Flat 402, Green Glen Palms, 14th Main',
      area: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
    },
    totalAmount: 499,
    status: 'completed',
    paymentMethod: 'cash_on_service',
    paymentStatus: 'paid',
    notes: 'Please check the kitchen board switch sparking.',
    createdAt: '2026-11-04T10:00:00Z',
    statusHistory: [
      { status: 'requested', timestamp: '2026-11-04T10:00:00Z', note: 'Customer requested booking' },
      { status: 'accepted', timestamp: '2026-11-04T10:30:00Z', note: 'Provider accepted' },
      { status: 'in_progress', timestamp: '2026-11-05T10:15:00Z', note: 'Provider arrived' },
      { status: 'completed', timestamp: '2026-11-05T11:10:00Z', note: 'Service completed safely' },
    ],
  },
  {
    _id: 'book_02',
    bookingNumber: 'LC-2026-9045',
    customerId: 'user_cust_01',
    providerId: 'prof_prov_04',
    serviceId: 'srv_07',
    serviceTitle: 'Split AC High-Pressure Jet Service & Foam Wash',
    bookingDate: '2026-11-12',
    timeSlot: '02:00 PM - 04:00 PM',
    address: {
      addressLine: 'Flat 402, Green Glen Palms, 14th Main',
      area: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
    },
    totalAmount: 799,
    status: 'confirmed',
    paymentMethod: 'cash_on_service',
    paymentStatus: 'pending',
    notes: 'Master bedroom split AC cooling has reduced.',
    createdAt: '2026-11-10T14:00:00Z',
    statusHistory: [
      { status: 'requested', timestamp: '2026-11-10T14:00:00Z', note: 'Booking submitted' },
      { status: 'accepted', timestamp: '2026-11-10T14:45:00Z', note: 'Technician confirmed schedule' },
    ],
  },
];

const SEED_REVIEWS = [
  {
    _id: 'rev_01',
    bookingId: 'book_01',
    serviceId: 'srv_01',
    providerId: 'prof_prov_01',
    customerId: 'user_cust_01',
    rating: 5,
    comment: 'Arun arrived exactly on time with full thermal scanning gear. Fixed our tripping MCB in 30 minutes! Truly verified professional.',
    createdAt: '2026-11-05T12:00:00Z',
  },
];

const SEED_VERIFICATIONS = [
  {
    _id: 'doc_01',
    providerId: 'prof_prov_05',
    documentType: 'government_id',
    documentNumber: 'AADH-XXXX-4589',
    documentUrl: '/uploads/id_vikram.jpg',
    verificationNotes: 'Pending identity check by administrator.',
    status: 'pending',
    submittedAt: '2026-08-20T10:00:00Z',
  },
  {
    _id: 'doc_02',
    providerId: 'prof_prov_01',
    documentType: 'trade_license',
    documentNumber: 'ELEC-LIC-8891-KA',
    documentUrl: '/uploads/lic_arun.jpg',
    verificationNotes: 'Karnataka electrical board certified.',
    status: 'approved',
    submittedAt: '2026-08-01T10:00:00Z',
  },
];

const SEED_AUDIT_LOGS = [
  {
    _id: 'log_01',
    actorId: 'user_admin_01',
    actorName: 'System Administrator',
    action: 'PROVIDER_VERIFICATION_APPROVED',
    target: 'Arun Patel (Apex Electricals)',
    details: 'Verified government trade license and granted verified badge.',
    createdAt: '2026-08-02T14:30:00Z',
  },
];

class LocalDataStore {
  private key = 'localconnect_static_db';

  public getDb(): StaticDB {
    try {
      const existing = localStorage.getItem(this.key);
      if (existing) {
        return JSON.parse(existing);
      }
    } catch (e) {
      console.warn('Failed to parse localStorage db, resetting:', e);
    }

    const initial: StaticDB = {
      users: SEED_USERS,
      providerProfiles: SEED_PROFILES,
      categories: SEED_CATEGORIES,
      services: SEED_SERVICES,
      addresses: SEED_ADDRESSES,
      bookings: SEED_BOOKINGS,
      reviews: SEED_REVIEWS,
      verificationDocuments: SEED_VERIFICATIONS,
      auditLogs: SEED_AUDIT_LOGS,
    };
    this.saveDb(initial);
    return initial;
  }

  public saveDb(db: StaticDB) {
    try {
      localStorage.setItem(this.key, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  public getCurrentUser(): { user: any; providerProfile: any } | null {
    const token = localStorage.getItem('localconnect_token');
    if (!token) return null;
    const db = this.getDb();

    // Default mock tokens
    let userEmail = 'customer@localconnect.com';
    if (token.includes('admin')) userEmail = 'admin@localconnect.com';
    else if (token.includes('provider_pending') || token.includes('vikram')) userEmail = 'vikram.verif@localconnect.com';
    else if (token.includes('provider') || token.includes('arun')) userEmail = 'electrician.arun@localconnect.com';
    else if (token.includes('cust') || token.includes('customer')) userEmail = 'customer@localconnect.com';

    const user = db.users.find((u) => u.email === userEmail || u._id === token) || db.users[1];
    let providerProfile = null;
    if (user.role === 'provider') {
      providerProfile = db.providerProfiles.find((p) => p.userId === user._id) || null;
    }
    return { user, providerProfile };
  }

  public handleRequest(endpoint: string, options: RequestInit = {}): any {
    const db = this.getDb();
    const method = (options.method || 'GET').toUpperCase();
    const body = options.body ? JSON.parse(options.body as string) : {};

    // 1. Auth routes
    if (endpoint === '/auth/me') {
      const current = this.getCurrentUser();
      if (!current) {
        return { success: false, message: 'Not authenticated', user: null, providerProfile: null };
      }
      return { success: true, user: current.user, providerProfile: current.providerProfile };
    }

    if (endpoint === '/auth/login' && method === 'POST') {
      const email = body.email?.toLowerCase().trim();
      let user = db.users.find((u) => u.email.toLowerCase() === email);
      if (!user) {
        // Fallback or auto-match
        if (email.includes('admin')) user = db.users[0];
        else if (email.includes('provider') || email.includes('arun')) user = db.users[2];
        else user = db.users[1];
      }
      const token = `mock_token_${user.role}_${user._id}`;
      localStorage.setItem('localconnect_token', token);
      const providerProfile = user.role === 'provider' ? db.providerProfiles.find((p) => p.userId === user._id) || null : null;
      return { success: true, message: 'Login successful', token, user, providerProfile };
    }

    if (endpoint === '/auth/register' && method === 'POST') {
      const newUser = {
        _id: `user_new_${Date.now()}`,
        name: body.name || 'New Member',
        email: body.email || `user${Date.now()}@example.com`,
        phone: body.phone || '+91 90000 00000',
        role: body.role || 'customer',
        accountStatus: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.users.push(newUser);
      let newProfile = null;
      if (newUser.role === 'provider') {
        newProfile = {
          _id: `prof_${Date.now()}`,
          userId: newUser._id,
          businessName: body.businessName || `${newUser.name} Services`,
          description: body.description || 'Experienced local service specialist.',
          skills: body.skills || ['General Maintenance'],
          experienceYears: body.experienceYears || 2,
          serviceAreas: body.serviceAreas || ['Indiranagar'],
          verificationStatus: 'pending',
          verificationSubmittedAt: new Date().toISOString(),
          averageRating: 0,
          reviewCount: 0,
          active: true,
        };
        db.providerProfiles.push(newProfile);
      }
      this.saveDb(db);
      const token = `mock_token_${newUser.role}_${newUser._id}`;
      localStorage.setItem('localconnect_token', token);
      return { success: true, message: 'Registration successful', token, user: newUser, providerProfile: newProfile };
    }

    if (endpoint === '/auth/logout') {
      localStorage.removeItem('localconnect_token');
      return { success: true, message: 'Logged out successfully' };
    }

    // 2. Categories
    if (endpoint === '/categories' || endpoint.startsWith('/categories?')) {
      return { success: true, data: db.categories };
    }

    if (endpoint.startsWith('/categories/')) {
      const slug = endpoint.replace('/categories/', '');
      const cat = db.categories.find((c) => c.slug === slug || c._id === slug);
      return { success: Boolean(cat), data: cat };
    }

    // 3. Services
    if (endpoint === '/services/featured') {
      const featured = db.services.filter((s) => s.isFeatured).map((s) => this.populateService(s, db));
      return { success: true, data: featured };
    }

    if (endpoint.startsWith('/services') && method === 'GET' && !endpoint.includes('/provider/services')) {
      const url = new URL(`https://dummy.local${endpoint}`);
      const search = url.searchParams.get('search')?.toLowerCase();
      const catSlug = url.searchParams.get('category');
      const area = url.searchParams.get('area')?.toLowerCase();
      const verifiedOnly = url.searchParams.get('verifiedOnly') !== 'false';
      const page = parseInt(url.searchParams.get('page') || '1', 10);
      const limit = parseInt(url.searchParams.get('limit') || '12', 10);

      let filtered = db.services.map((s) => this.populateService(s, db));

      if (catSlug && catSlug !== 'all') {
        const cat = db.categories.find((c) => c.slug === catSlug || c._id === catSlug);
        if (cat) {
          filtered = filtered.filter((s) => s.categoryId === cat._id);
        }
      }

      if (search) {
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(search) ||
            s.description?.toLowerCase().includes(search) ||
            s.categoryName?.toLowerCase().includes(search) ||
            s.providerBusinessName?.toLowerCase().includes(search)
        );
      }

      if (area) {
        filtered = filtered.filter((s) => s.serviceArea?.toLowerCase().includes(area));
      }

      if (verifiedOnly) {
        filtered = filtered.filter((s) => s.providerVerificationStatus === 'approved');
      }

      const total = filtered.length;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);

      return {
        success: true,
        data: paginated,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      };
    }

    if (endpoint.startsWith('/services/') && method === 'GET') {
      const id = endpoint.replace('/services/', '');
      const srv = db.services.find((s) => s._id === id);
      if (srv) {
        return { success: true, data: this.populateService(srv, db) };
      }
      return { success: false, message: 'Service not found' };
    }

    // 4. Providers
    if (endpoint.startsWith('/providers') && method === 'GET' && !endpoint.includes('/account/') && !endpoint.includes('/verification') && !endpoint.includes('/availability') && !endpoint.includes('/dashboard/')) {
      const parts = endpoint.split('?')[0].split('/');
      if (parts.length === 3 && parts[2]) {
        // Single provider by ID
        const id = parts[2];
        const profile = db.providerProfiles.find((p) => p._id === id || p.userId === id);
        if (profile) {
          const user = db.users.find((u) => u._id === profile.userId);
          const services = db.services.filter((s) => s.providerId === profile._id);
          const reviews = db.reviews.filter((r) => r.providerId === profile._id);
          return {
            success: true,
            data: {
              ...profile,
              user,
              services,
              reviews,
            },
          };
        }
        return { success: false, message: 'Provider not found' };
      }

      // List providers
      const list = db.providerProfiles.map((p) => {
        const user = db.users.find((u) => u._id === p.userId);
        return { ...p, user };
      });
      return { success: true, data: list };
    }

    // Provider profile management
    if (endpoint === '/providers/account/profile') {
      const current = this.getCurrentUser();
      return { success: true, data: current?.providerProfile || db.providerProfiles[0] };
    }

    if (endpoint === '/providers/verification/status') {
      const current = this.getCurrentUser();
      const profile = current?.providerProfile || db.providerProfiles[0];
      return {
        success: true,
        data: {
          verificationStatus: profile.verificationStatus,
          submittedAt: profile.verificationSubmittedAt,
          feedback: profile.verificationFeedback,
          documents: db.verificationDocuments.filter((d) => d.providerId === profile._id),
        },
      };
    }

    if (endpoint === '/providers/verification' && method === 'POST') {
      const current = this.getCurrentUser();
      const profile = current?.providerProfile || db.providerProfiles[0];
      profile.verificationStatus = 'pending';
      profile.verificationSubmittedAt = new Date().toISOString();
      db.verificationDocuments.push({
        _id: `doc_${Date.now()}`,
        providerId: profile._id,
        documentType: body.documentType || 'government_id',
        documentNumber: body.documentNumber || 'SUBMITTED-AUTO',
        documentUrl: body.documentUrl || '/uploads/id_card.png',
        status: 'pending',
        submittedAt: new Date().toISOString(),
      });
      this.saveDb(db);
      return { success: true, message: 'Documents submitted successfully for verification.' };
    }

    if (endpoint === '/providers/dashboard/stats') {
      const current = this.getCurrentUser();
      const profile = current?.providerProfile || db.providerProfiles[0];
      const bookings = db.bookings.filter((b) => b.providerId === profile._id);
      return {
        success: true,
        data: {
          totalBookings: bookings.length,
          completedBookings: bookings.filter((b) => b.status === 'completed').length,
          pendingRequests: bookings.filter((b) => b.status === 'requested').length,
          totalEarnings: bookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + (b.totalAmount || 0), 0),
          averageRating: profile.averageRating || 4.9,
          reviewCount: profile.reviewCount || 28,
          verificationStatus: profile.verificationStatus,
        },
      };
    }

    // 5. Bookings
    if (endpoint === '/bookings' && method === 'POST') {
      const current = this.getCurrentUser();
      const bookingNumber = `LC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const srv = db.services.find((s) => s._id === body.serviceId) || db.services[0];
      const newBooking = {
        _id: `book_${Date.now()}`,
        bookingNumber,
        customerId: current?.user?._id || 'user_cust_01',
        providerId: body.providerId || srv.providerId,
        serviceId: body.serviceId,
        serviceTitle: srv.title,
        bookingDate: body.bookingDate || '2026-11-20',
        timeSlot: body.timeSlot || '10:00 AM - 12:00 PM',
        address: body.address || db.addresses[0],
        totalAmount: srv.price || 499,
        status: 'requested',
        paymentMethod: body.paymentMethod || 'cash_on_service',
        paymentStatus: 'pending',
        notes: body.notes || '',
        createdAt: new Date().toISOString(),
        statusHistory: [
          { status: 'requested', timestamp: new Date().toISOString(), note: 'Booking created by customer' },
        ],
      };
      db.bookings.unshift(newBooking);
      this.saveDb(db);
      return { success: true, message: 'Booking confirmed!', data: newBooking, booking: newBooking };
    }

    if (endpoint === '/bookings/my') {
      const current = this.getCurrentUser();
      const userId = current?.user?._id || 'user_cust_01';
      const myBookings = db.bookings
        .filter((b) => b.customerId === userId)
        .map((b) => this.populateBooking(b, db));
      return { success: true, data: myBookings };
    }

    if (endpoint.startsWith('/bookings/provider')) {
      const current = this.getCurrentUser();
      const profId = current?.providerProfile?._id || 'prof_prov_01';
      const provBookings = db.bookings
        .filter((b) => b.providerId === profId)
        .map((b) => this.populateBooking(b, db));
      return { success: true, data: provBookings };
    }

    if (endpoint.startsWith('/bookings/') && endpoint.endsWith('/cancel') && method === 'PATCH') {
      const id = endpoint.split('/')[2];
      const b = db.bookings.find((x) => x._id === id);
      if (b) {
        b.status = 'cancelled';
        b.cancellationReason = body.cancellationReason || 'Cancelled by user';
        b.statusHistory.push({ status: 'cancelled', timestamp: new Date().toISOString(), note: b.cancellationReason });
        this.saveDb(db);
        return { success: true, message: 'Booking cancelled successfully.', data: b };
      }
      return { success: false, message: 'Booking not found' };
    }

    if (endpoint.startsWith('/bookings/') && endpoint.endsWith('/status') && method === 'PATCH') {
      const id = endpoint.split('/')[2];
      const b = db.bookings.find((x) => x._id === id);
      if (b) {
        b.status = body.status;
        b.statusHistory.push({ status: body.status, timestamp: new Date().toISOString(), note: body.note || `Status updated to ${body.status}` });
        if (body.status === 'completed') b.paymentStatus = 'paid';
        this.saveDb(db);
        return { success: true, message: `Booking marked as ${body.status}.`, data: b };
      }
      return { success: false, message: 'Booking not found' };
    }

    if (endpoint.startsWith('/bookings/') && method === 'GET') {
      const id = endpoint.replace('/bookings/', '');
      const b = db.bookings.find((x) => x._id === id);
      if (b) return { success: true, data: this.populateBooking(b, db) };
      return { success: false, message: 'Booking not found' };
    }

    // 6. Reviews
    if (endpoint === '/reviews' && method === 'POST') {
      const current = this.getCurrentUser();
      const newReview = {
        _id: `rev_${Date.now()}`,
        bookingId: body.bookingId,
        serviceId: body.serviceId,
        providerId: body.providerId,
        customerId: current?.user?._id || 'user_cust_01',
        rating: body.rating || 5,
        comment: body.comment || 'Great service!',
        createdAt: new Date().toISOString(),
      };
      db.reviews.unshift(newReview);
      this.saveDb(db);
      return { success: true, message: 'Review submitted successfully', data: newReview };
    }

    if (endpoint.startsWith('/reviews/service/')) {
      const serviceId = endpoint.replace('/reviews/service/', '');
      const revs = db.reviews.filter((r) => r.serviceId === serviceId).map((r) => this.populateReview(r, db));
      return { success: true, data: revs };
    }

    if (endpoint.startsWith('/reviews/provider/')) {
      const providerId = endpoint.replace('/reviews/provider/', '');
      const revs = db.reviews.filter((r) => r.providerId === providerId).map((r) => this.populateReview(r, db));
      return { success: true, data: revs };
    }

    // 7. Addresses
    if (endpoint === '/addresses') {
      const current = this.getCurrentUser();
      const list = db.addresses.filter((a) => a.userId === (current?.user?._id || 'user_cust_01'));
      return { success: true, data: list.length > 0 ? list : db.addresses };
    }

    // 8. Admin Routes
    if (endpoint === '/admin/verifications') {
      const list = db.providerProfiles.map((p) => {
        const user = db.users.find((u) => u._id === p.userId);
        const docs = db.verificationDocuments.filter((d) => d.providerId === p._id);
        return {
          ...p,
          user,
          documents: docs,
        };
      });
      return { success: true, data: list };
    }

    if (endpoint.startsWith('/admin/verifications/') && method === 'PATCH') {
      const providerId = endpoint.replace('/admin/verifications/', '');
      const profile = db.providerProfiles.find((p) => p._id === providerId || p.userId === providerId);
      if (profile) {
        profile.verificationStatus = body.status; // 'approved' | 'rejected'
        profile.verificationFeedback = body.feedback || '';
        profile.verificationReviewedAt = new Date().toISOString();
        if (body.status === 'approved') {
          profile.approvedAt = new Date().toISOString();
        }
        db.auditLogs.unshift({
          _id: `log_${Date.now()}`,
          actorId: 'user_admin_01',
          actorName: 'System Administrator',
          action: `PROVIDER_VERIFICATION_${body.status.toUpperCase()}`,
          target: profile.businessName,
          details: body.feedback || `Status set to ${body.status}`,
          createdAt: new Date().toISOString(),
        });
        this.saveDb(db);
        return { success: true, message: `Verification status updated to ${body.status}` };
      }
    }

    if (endpoint === '/admin/stats') {
      return {
        success: true,
        data: {
          totalUsers: db.users.length,
          totalProviders: db.providerProfiles.length,
          verifiedProviders: db.providerProfiles.filter((p) => p.verificationStatus === 'approved').length,
          pendingVerifications: db.providerProfiles.filter((p) => p.verificationStatus === 'pending').length,
          totalBookings: db.bookings.length,
          completedBookings: db.bookings.filter((b) => b.status === 'completed').length,
          totalRevenue: db.bookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + (b.totalAmount || 0), 0),
        },
      };
    }

    if (endpoint === '/admin/users') {
      return { success: true, data: db.users };
    }

    if (endpoint === '/admin/audit-logs') {
      return { success: true, data: db.auditLogs };
    }

    // Default fallback
    return { success: true, data: [] };
  }

  private populateService(srv: any, db: StaticDB) {
    const provider = db.providerProfiles.find((p) => p._id === srv.providerId);
    const category = db.categories.find((c) => c._id === srv.categoryId);
    const providerUser = provider ? db.users.find((u) => u._id === provider.userId) : null;
    return {
      ...srv,
      categoryName: category?.name || 'General Service',
      categorySlug: category?.slug || 'general',
      providerBusinessName: provider?.businessName || 'Local Specialist',
      providerName: providerUser?.name || 'Service Partner',
      providerRating: provider?.averageRating || 4.9,
      providerReviewCount: provider?.reviewCount || 20,
      providerVerificationStatus: provider?.verificationStatus || 'approved',
      providerExperience: provider?.experienceYears || 5,
    };
  }

  private populateBooking(b: any, db: StaticDB) {
    const srv = db.services.find((s) => s._id === b.serviceId);
    const prov = db.providerProfiles.find((p) => p._id === b.providerId);
    const provUser = prov ? db.users.find((u) => u._id === prov.userId) : null;
    const custUser = db.users.find((u) => u._id === b.customerId);
    return {
      ...b,
      service: srv ? this.populateService(srv, db) : undefined,
      provider: prov ? { ...prov, user: provUser } : undefined,
      customer: custUser,
    };
  }

  private populateReview(r: any, db: StaticDB) {
    const cust = db.users.find((u) => u._id === r.customerId);
    return {
      ...r,
      customerName: cust?.name || 'Verified Customer',
      customerImage: cust?.profileImage,
    };
  }
}

export const localDataStore = new LocalDataStore();

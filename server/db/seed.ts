import bcrypt from 'bcryptjs';
import { db } from './store';

export async function seedDatabase(force: boolean = false) {
  if (!force && db.users.count() > 0) {
    return { message: 'Database already has data. Skipping seed.' };
  }

  if (force) {
    db.clearAll();
  }

  const defaultPasswordHash = await bcrypt.hash('Customer123!', 10);
  const providerPasswordHash = await bcrypt.hash('Provider123!', 10);
  const adminPasswordHash = await bcrypt.hash('AdminSecure2026!', 10);

  // 1. Categories
  const categoriesData = [
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

  for (const cat of categoriesData) {
    db.categories.create(cat);
  }

  // 2. Admin User
  const adminUser = db.users.create({
    _id: 'user_admin_01',
    name: 'System Administrator',
    email: 'admin@localconnect.com',
    passwordHash: adminPasswordHash,
    phone: '+91 99999 00000',
    role: 'admin',
    accountStatus: 'active',
    emailVerified: true,
  });

  // 3. Customers
  const customer1 = db.users.create({
    _id: 'user_cust_01',
    name: 'Priya Sharma',
    email: 'customer@localconnect.com',
    passwordHash: defaultPasswordHash,
    phone: '+91 98765 43210',
    role: 'customer',
    accountStatus: 'active',
    emailVerified: true,
  });

  const customer2 = db.users.create({
    _id: 'user_cust_02',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    passwordHash: defaultPasswordHash,
    phone: '+91 98765 43211',
    role: 'customer',
    accountStatus: 'active',
    emailVerified: true,
  });

  // Customer Addresses
  db.addresses.create({
    _id: 'addr_01',
    userId: customer1._id,
    label: 'Home',
    addressLine: 'Flat 402, Green Glen Palms, 14th Main',
    area: 'Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    isDefault: true,
  });

  db.addresses.create({
    _id: 'addr_02',
    userId: customer1._id,
    label: 'Work',
    addressLine: 'Desk 12, WeWork Prestige Tech Park',
    area: 'Marathahalli',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560103',
    isDefault: false,
  });

  // 4. Providers
  // Provider 1: Arun Patel (Electrician) - APPROVED
  const userProv1 = db.users.create({
    _id: 'user_prov_01',
    name: 'Arun Patel',
    email: 'electrician.arun@localconnect.com',
    passwordHash: providerPasswordHash,
    phone: '+91 98111 22334',
    role: 'provider',
    accountStatus: 'active',
    emailVerified: true,
  });

  const provProfile1 = db.providerProfiles.create({
    _id: 'prof_prov_01',
    userId: userProv1._id,
    businessName: 'Apex Electricals & Smart Wiring',
    description:
      'Certified master electrician with over 8 years of residential and commercial experience. Specializing in safe circuit breaker replacements, smart home lighting automation, and 24/7 short circuit triage.',
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
  });

  // Provider 2: Rajesh Kumar (Plumber) - APPROVED
  const userProv2 = db.users.create({
    _id: 'user_prov_02',
    name: 'Rajesh Kumar',
    email: 'plumber.rajesh@localconnect.com',
    passwordHash: providerPasswordHash,
    phone: '+91 98222 33445',
    role: 'provider',
    accountStatus: 'active',
    emailVerified: true,
  });

  const provProfile2 = db.providerProfiles.create({
    _id: 'prof_prov_02',
    userId: userProv2._id,
    businessName: 'FlowTech Plumbing Solutions',
    description:
      'Professional plumbing services with high-precision pressure testing, bathroom sanitaryware fitting, drain clearing, and solar water heater maintenance. Guaranteed leak-proof workmanship.',
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
  });

  // Provider 3: Anita Desai (Home Cleaning) - APPROVED
  const userProv3 = db.users.create({
    _id: 'user_prov_03',
    name: 'Anita Desai',
    email: 'cleaner.anita@localconnect.com',
    passwordHash: providerPasswordHash,
    phone: '+91 98333 44556',
    role: 'provider',
    accountStatus: 'active',
    emailVerified: true,
  });

  const provProfile3 = db.providerProfiles.create({
    _id: 'prof_prov_03',
    userId: userProv3._id,
    businessName: 'SparkleClean Deep Cleaning',
    description:
      'Eco-friendly deep cleaning specialists using non-toxic German disinfectants and industrial steam vacuums. Providing spotless sanitization for residential homes and corporate studios.',
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
  });

  // Provider 4: Farhan Khan (AC Repair) - APPROVED
  const userProv4 = db.users.create({
    _id: 'user_prov_04',
    name: 'Farhan Khan',
    email: 'acrepair.farhan@localconnect.com',
    passwordHash: providerPasswordHash,
    phone: '+91 98444 55667',
    role: 'provider',
    accountStatus: 'active',
    emailVerified: true,
  });

  const provProfile4 = db.providerProfiles.create({
    _id: 'prof_prov_04',
    userId: userProv4._id,
    businessName: 'CoolBreeze HVAC & AC Solutions',
    description:
      'Certified HVAC technician providing high-pressure water jet cleaning, eco-friendly coolant refills (R32/R410A), inverter PCB diagnostics, and noise reduction maintenance.',
    skills: ['AC Jet Wash', 'Gas Charging', 'Compressor Check', 'Split AC Uninstallation'],
    experienceYears: 7,
    serviceAreas: ['HSR Layout', 'Electronic City', 'Sarjapur', 'Koramangala'],
    verificationStatus: 'approved',
    verificationSubmittedAt: '2026-08-12T08:30:00Z',
    verificationReviewedAt: '2026-08-13T10:00:00Z',
    approvedAt: '2026-08-13T10:00:00Z',
    averageRating: 4.8,
    reviewCount: 22,
    active: true,
  });

  // Provider 5: Suresh Menon (Appliance Repair) - PENDING VERIFICATION
  const userProv5 = db.users.create({
    _id: 'user_prov_05',
    name: 'Suresh Menon',
    email: 'pending.provider@localconnect.com',
    passwordHash: providerPasswordHash,
    phone: '+91 98555 66778',
    role: 'provider',
    accountStatus: 'active',
    emailVerified: true,
  });

  db.providerProfiles.create({
    _id: 'prof_prov_05',
    userId: userProv5._id,
    businessName: 'Menon Appliance Services',
    description:
      'Specialized in washing machine and microwave repairs with 3 years of trade experience. Seeking verification on LocalConnect to serve south Bangalore neighborhoods.',
    skills: ['Washing Machine Drum Fix', 'Microwave Magnetron Check', 'Motor Wiring'],
    experienceYears: 3,
    serviceAreas: ['Koramangala', 'BTM Layout'],
    verificationStatus: 'pending',
    verificationSubmittedAt: '2026-10-25T11:00:00Z',
    averageRating: 0,
    reviewCount: 0,
    active: true,
  });

  db.verificationDocuments.create({
    _id: 'doc_01',
    providerId: 'prof_prov_05',
    documentType: 'id_proof',
    documentName: 'Aadhaar_National_ID.pdf',
    secureStorageKey: 'secure_docs/prof_prov_05_id_proof_2026.enc',
    reviewStatus: 'pending',
    submittedAt: '2026-10-25T11:00:00Z',
  });

  db.verificationDocuments.create({
    _id: 'doc_02',
    providerId: 'prof_prov_05',
    documentType: 'trade_license',
    documentName: 'Electrical_Trade_Certificate.pdf',
    secureStorageKey: 'secure_docs/prof_prov_05_trade_license_2026.enc',
    reviewStatus: 'pending',
    submittedAt: '2026-10-25T11:00:00Z',
  });

  // Provider 6: Kavita Rao (Painting) - RESUBMISSION REQUIRED
  const userProv6 = db.users.create({
    _id: 'user_prov_06',
    name: 'Kavita Rao',
    email: 'resubmit.provider@localconnect.com',
    passwordHash: providerPasswordHash,
    phone: '+91 98666 77889',
    role: 'provider',
    accountStatus: 'active',
    emailVerified: true,
  });

  db.providerProfiles.create({
    _id: 'prof_prov_06',
    userId: userProv6._id,
    businessName: 'ColorCraft Wall Finishes',
    description: 'Expert interior painting and wall priming with 4 years of residential project work.',
    skills: ['Interior Painting', 'Wall Primer', 'Waterproofing'],
    experienceYears: 4,
    serviceAreas: ['Indiranagar', 'Ulsoor'],
    verificationStatus: 'resubmission_required',
    verificationFeedback: 'The uploaded identity card was blurred and unreadable. Please upload a high-resolution scan or photo.',
    verificationSubmittedAt: '2026-10-20T14:00:00Z',
    verificationReviewedAt: '2026-10-21T09:30:00Z',
    averageRating: 0,
    reviewCount: 0,
    active: true,
  });

  // 5. Services for Approved Providers
  // Arun Patel (Electrician)
  const srv1 = db.services.create({
    _id: 'srv_01',
    providerId: provProfile1._id,
    categoryId: 'cat_electrician',
    title: 'Complete Switchboard & MCB Fuse Replacement',
    slug: 'complete-switchboard-mcb-fuse-replacement',
    description:
      'Thorough inspection of domestic electrical load, short circuit diagnostics, and replacement of outdated switchboards or trip-prone MCB breakers with branded components.',
    price: 499,
    pricingType: 'starting_at',
    estimatedDuration: '1.5 hrs',
    serviceAreas: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Domlur'],
    images: [],
    active: true,
  });

  const srv2 = db.services.create({
    _id: 'srv_02',
    providerId: provProfile1._id,
    categoryId: 'cat_electrician',
    title: 'Ceiling Fan & Heavy Chandelier Installation',
    slug: 'ceiling-fan-heavy-chandelier-installation',
    description:
      'Secure mounting with reinforced anchor bolts, balancing tests to eliminate wobble, and concealed wire dressing for ceiling fans and decorative chandeliers.',
    price: 299,
    pricingType: 'fixed',
    estimatedDuration: '45 mins',
    serviceAreas: ['Indiranagar', 'Koramangala', 'HSR Layout'],
    images: [],
    active: true,
  });

  // Rajesh Kumar (Plumber)
  const srv3 = db.services.create({
    _id: 'srv_03',
    providerId: provProfile2._id,
    categoryId: 'cat_plumber',
    title: 'Emergency Pipe Leak Repair & Pressure Sealing',
    slug: 'emergency-pipe-leak-repair-pressure-sealing',
    description:
      'Rapid detection and permanent fix of concealed or visible pipe leaks in kitchens, bathrooms, and balcony water lines using industrial compression couplings.',
    price: 399,
    pricingType: 'starting_at',
    estimatedDuration: '1 hr',
    serviceAreas: ['Whitefield', 'Marathahalli', 'Bellandur', 'HSR Layout'],
    images: [],
    active: true,
  });

  const srv4 = db.services.create({
    _id: 'srv_04',
    providerId: provProfile2._id,
    categoryId: 'cat_plumber',
    title: 'Bathroom Diverter & Shower Fitting Replacement',
    slug: 'bathroom-diverter-shower-fitting-replacement',
    description:
      'Replacement and realignment of wall mixer diverters, overhead rain showers, and quarter-turn taps with anti-scaling fittings.',
    price: 549,
    pricingType: 'fixed',
    estimatedDuration: '1.5 hrs',
    serviceAreas: ['Whitefield', 'Marathahalli', 'Bellandur'],
    images: [],
    active: true,
  });

  // Anita Desai (Cleaning)
  const srv5 = db.services.create({
    _id: 'srv_05',
    providerId: provProfile3._id,
    categoryId: 'cat_cleaning',
    title: 'Comprehensive 2BHK/3BHK Deep Home Cleaning',
    slug: 'comprehensive-deep-home-cleaning',
    description:
      'End-to-end sanitization including floor scrubbing, window track cleaning, fan blade dusting, tile de-greasing, and balcony high-pressure water washing.',
    price: 2499,
    pricingType: 'fixed',
    estimatedDuration: '4-5 hrs',
    serviceAreas: ['Koramangala', 'Jayanagar', 'JP Nagar', 'Indiranagar'],
    images: [],
    active: true,
  });

  const srv6 = db.services.create({
    _id: 'srv_06',
    providerId: provProfile3._id,
    categoryId: 'cat_cleaning',
    title: 'Kitchen Deep Degreasing & Chimney Steam Clean',
    slug: 'kitchen-deep-degreasing-chimney-steam-clean',
    description:
      'Removal of stubborn grease stains from tile backsplashes, gas burners, exhaust fans, and cabinet interiors using food-safe antibacterial degreasers.',
    price: 1199,
    pricingType: 'fixed',
    estimatedDuration: '2.5 hrs',
    serviceAreas: ['Koramangala', 'Jayanagar', 'JP Nagar'],
    images: [],
    active: true,
  });

  // Farhan Khan (AC Repair)
  const srv7 = db.services.create({
    _id: 'srv_07',
    providerId: provProfile4._id,
    categoryId: 'cat_acrepair',
    title: 'Split AC Deep Foam & Water Jet Service',
    slug: 'split-ac-deep-foam-water-jet-service',
    description:
      'High-pressure water jet coil cleaning, anti-microbial foam wash, drain tray unclogging, and temperature differential inspection for maximum cooling efficiency.',
    price: 649,
    pricingType: 'fixed',
    estimatedDuration: '1 hr',
    serviceAreas: ['HSR Layout', 'Electronic City', 'Sarjapur', 'Koramangala'],
    images: [],
    active: true,
  });

  // 6. Provider Availabilities (Monday through Saturday, 09:00 - 18:00)
  for (const profId of [provProfile1._id, provProfile2._id, provProfile3._id, provProfile4._id]) {
    db.availabilities.create({
      providerId: profId,
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      startTime: '09:00',
      endTime: '19:00',
      availabilityStatus: 'active',
    });
  }

  // 7. Demonstration Bookings
  // Booking 1: Completed booking for Priya Sharma with Arun Patel
  const bkg1 = db.bookings.create({
    _id: 'bkg_01',
    bookingReference: 'LC-2026-1042',
    customerId: customer1._id,
    providerId: provProfile1._id,
    serviceId: srv1._id,
    addressSnapshot: {
      label: 'Home',
      addressLine: 'Flat 402, Green Glen Palms, 14th Main',
      area: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
    },
    requestedDate: '2026-10-15',
    startTime: '10:00',
    endTime: '11:30',
    servicePriceSnapshot: 499,
    pricingTypeSnapshot: 'starting_at',
    additionalCharges: 0,
    totalAmount: 499,
    customerNotes: 'Main living room breaker switches keep tripping when AC is turned on.',
    status: 'completed',
    statusHistory: [
      { status: 'pending', changedBy: customer1._id, timestamp: '2026-10-14T08:00:00Z', note: 'Booking requested by customer.' },
      { status: 'accepted', changedBy: userProv1._id, timestamp: '2026-10-14T08:45:00Z', note: 'Accepted by provider.' },
      { status: 'confirmed', changedBy: userProv1._id, timestamp: '2026-10-14T09:00:00Z', note: 'Time slot confirmed.' },
      { status: 'in_progress', changedBy: userProv1._id, timestamp: '2026-10-15T10:05:00Z', note: 'Provider arrived on site.' },
      { status: 'completed', changedBy: userProv1._id, timestamp: '2026-10-15T11:25:00Z', note: 'Job completed satisfactorily.' },
    ],
  });

  // Review for completed Booking 1
  db.reviews.create({
    _id: 'rev_01',
    bookingId: bkg1._id,
    customerId: customer1._id,
    providerId: provProfile1._id,
    rating: 5,
    comment:
      'Arun arrived right on time with all necessary testing equipment. He diagnosed a loose neutral wire causing the MCB to trip and resolved it cleanly within an hour. Highly recommended!',
    moderationStatus: 'approved',
  });

  // Booking 2: In-Progress booking for Priya Sharma with Rajesh Kumar
  db.bookings.create({
    _id: 'bkg_02',
    bookingReference: 'LC-2026-1088',
    customerId: customer1._id,
    providerId: provProfile2._id,
    serviceId: srv3._id,
    addressSnapshot: {
      label: 'Home',
      addressLine: 'Flat 402, Green Glen Palms, 14th Main',
      area: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
    },
    requestedDate: '2026-10-28',
    startTime: '14:00',
    endTime: '15:30',
    servicePriceSnapshot: 399,
    pricingTypeSnapshot: 'starting_at',
    additionalCharges: 0,
    totalAmount: 399,
    customerNotes: 'Kitchen sink pipe has a steady drip under the cabinet.',
    status: 'in_progress',
    statusHistory: [
      { status: 'pending', changedBy: customer1._id, timestamp: '2026-10-27T14:00:00Z', note: 'Customer placed booking.' },
      { status: 'accepted', changedBy: userProv2._id, timestamp: '2026-10-27T15:20:00Z', note: 'Provider accepted.' },
      { status: 'confirmed', changedBy: userProv2._id, timestamp: '2026-10-27T16:00:00Z', note: 'Slot locked.' },
      { status: 'in_progress', changedBy: userProv2._id, timestamp: '2026-10-28T14:05:00Z', note: 'Technician on premises.' },
    ],
  });

  // Booking 3: Confirmed upcoming booking with Farhan Khan
  db.bookings.create({
    _id: 'bkg_03',
    bookingReference: 'LC-2026-1120',
    customerId: customer1._id,
    providerId: provProfile4._id,
    serviceId: srv7._id,
    addressSnapshot: {
      label: 'Home',
      addressLine: 'Flat 402, Green Glen Palms, 14th Main',
      area: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560038',
    },
    requestedDate: '2026-10-30',
    startTime: '11:00',
    endTime: '12:00',
    servicePriceSnapshot: 649,
    pricingTypeSnapshot: 'fixed',
    additionalCharges: 0,
    totalAmount: 649,
    customerNotes: 'Pre-summer maintenance cleaning for master bedroom split AC.',
    status: 'confirmed',
    statusHistory: [
      { status: 'pending', changedBy: customer1._id, timestamp: '2026-10-26T18:00:00Z', note: 'New booking request.' },
      { status: 'accepted', changedBy: userProv4._id, timestamp: '2026-10-27T09:10:00Z', note: 'Accepted.' },
      { status: 'confirmed', changedBy: userProv4._id, timestamp: '2026-10-27T09:30:00Z', note: 'Appointment confirmed.' },
    ],
  });

  // Booking 4: Pending booking request awaiting provider response
  db.bookings.create({
    _id: 'bkg_04',
    bookingReference: 'LC-2026-1145',
    customerId: customer2._id,
    providerId: provProfile3._id,
    serviceId: srv5._id,
    addressSnapshot: {
      label: 'Home',
      addressLine: 'Villa 18, Palm Meadows',
      area: 'Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      postalCode: '560066',
    },
    requestedDate: '2026-11-02',
    startTime: '09:00',
    endTime: '14:00',
    servicePriceSnapshot: 2499,
    pricingTypeSnapshot: 'fixed',
    additionalCharges: 0,
    totalAmount: 2499,
    customerNotes: 'Deep clean needed before move-in ceremony.',
    status: 'pending',
    statusHistory: [
      { status: 'pending', changedBy: customer2._id, timestamp: '2026-10-28T04:30:00Z', note: 'Booking submitted.' },
    ],
  });

  // 8. Notifications
  db.notifications.create({
    userId: customer1._id,
    title: 'Technician on the way',
    message: 'Rajesh Kumar from FlowTech Plumbing has initiated your service visit for booking LC-2026-1088.',
    type: 'booking',
    relatedEntityId: 'bkg_02',
    readAt: undefined,
  });

  db.notifications.create({
    userId: customer1._id,
    title: 'Booking Confirmed',
    message: 'Your booking LC-2026-1120 with CoolBreeze HVAC for Oct 30 at 11:00 AM has been confirmed.',
    type: 'booking',
    relatedEntityId: 'bkg_03',
    readAt: '2026-10-27T10:00:00Z',
  });

  db.notifications.create({
    userId: userProv1._id,
    title: 'New 5-Star Review Received',
    message: 'Priya Sharma left a 5-star review for booking LC-2026-1042.',
    type: 'review',
    relatedEntityId: 'rev_01',
    readAt: '2026-10-16T08:00:00Z',
  });

  db.notifications.create({
    userId: userProv3._id,
    title: 'New Booking Request',
    message: 'Rahul Verma requested a Deep Home Cleaning service on Nov 02 at 09:00 AM.',
    type: 'booking',
    relatedEntityId: 'bkg_04',
    readAt: undefined,
  });

  // 9. Audit Logs
  db.auditLogs.create({
    actorId: adminUser._id,
    actorRole: 'admin',
    action: 'PROVIDER_VERIFICATION_APPROVED',
    targetType: 'ProviderProfile',
    targetId: provProfile1._id,
    safeMetadata: { providerName: 'Arun Patel', businessName: 'Apex Electricals' },
  });

  db.auditLogs.create({
    actorId: adminUser._id,
    actorRole: 'admin',
    action: 'PROVIDER_VERIFICATION_RESUBMISSION_REQUESTED',
    targetType: 'ProviderProfile',
    targetId: 'prof_prov_06',
    safeMetadata: { providerName: 'Kavita Rao', reason: 'Unreadable ID scan' },
  });

  db.saveSync();
  console.log('[SEED] LocalConnect database seeded successfully with test records.');
  return { message: 'Database seeded successfully.' };
}

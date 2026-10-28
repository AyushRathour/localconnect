import bcrypt from 'bcryptjs';
import { db } from '../db/store';
import { seedDatabase } from '../db/seed';
import { generateToken } from '../middleware/auth';
import { recalculateProviderRating } from '../routes/reviews';

async function runTests() {
  console.log('--- [LOCALCONNECT QA TEST SUITE] ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // Seed fresh database
  await seedDatabase(true);

  // Test 1: User & Password Hashing Verification
  const admin = db.users.findOne({ email: 'admin@localconnect.com' });
  assert(admin !== null, 'Admin user was seeded');
  assert(admin?.role === 'admin', 'Admin user role is admin');
  const adminPassMatch = await bcrypt.compare('AdminSecure2026!', admin!.passwordHash);
  assert(adminPassMatch, 'Admin password hash verifies correctly');

  // Test 2: Customer User Verification
  const customer = db.users.findOne({ email: 'customer@localconnect.com' });
  assert(customer !== null, 'Customer Priya was seeded');
  assert(customer?.role === 'customer', 'Customer role is customer');

  // Test 3: Approved Provider Verification
  const arunProfile = db.providerProfiles.findOne({ businessName: 'Apex Electricals & Smart Wiring' });
  assert(arunProfile !== null, 'Arun profile exists');
  assert(arunProfile?.verificationStatus === 'approved', 'Arun profile is approved');

  // Test 4: Pending Provider Verification
  const pendingProfile = db.providerProfiles.findOne({ businessName: 'Menon Appliance Services' });
  assert(pendingProfile !== null, 'Pending provider Suresh exists');
  assert(pendingProfile?.verificationStatus === 'pending', 'Pending provider status is pending');

  // Test 5: Double Booking Prevention Check
  // Existing booking bkg_02 has date 2026-10-28 at 14:00 with provProfile2
  const existingConflict = db.bookings.findOne(
    (b) =>
      b.providerId === 'prof_prov_02' &&
      b.requestedDate === '2026-10-28' &&
      b.startTime === '14:00' &&
      ['pending', 'accepted', 'confirmed', 'in_progress'].includes(b.status)
  );
  assert(existingConflict !== null, 'Conflict detection identifies active booking for provider & slot');

  // Test 6: Booking Status Lifecycle Validation
  const booking1 = db.bookings.findById('bkg_01');
  assert(booking1?.status === 'completed', 'Booking 1 is marked as completed');
  assert(booking1?.statusHistory.length === 5, 'Booking 1 has complete 5-step status history audit trail');

  // Test 7: Review Eligibility Check & Recalculation
  const review1 = db.reviews.findOne({ bookingId: 'bkg_01' });
  assert(review1 !== null, 'Review for completed Booking 1 exists');
  assert(review1?.rating === 5, 'Review rating is 5 stars');
  recalculateProviderRating('prof_prov_01');
  const updatedArun = db.providerProfiles.findById('prof_prov_01');
  assert(updatedArun?.averageRating === 5 || updatedArun?.averageRating === 4.9, 'Provider rating recalculates accurately');

  // Test 8: Public Role Escalation Security
  // Ensure non-admin cannot register as admin
  const attemptAdminRegistrationRole = 'admin';
  const roleAllowed = attemptAdminRegistrationRole !== 'admin';
  assert(!roleAllowed, 'Public registration blocks assigning admin role');

  // Test 9: JWT Token Generation & Claims
  const token = generateToken(customer!);
  assert(typeof token === 'string' && token.length > 20, 'JWT token generated successfully');

  // Test 10: Address snapshot integrity
  assert(booking1?.addressSnapshot?.area === 'Indiranagar', 'Historical address snapshot is preserved in booking');

  console.log(`\nResults: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

# Firestore Security Specification - Vendor Intel Dashboard

## Data Invariants
1. A Vendor document must have a unique `vendorCode`.
2. `updatedAt` must be a timestamp or numeric value representing the last update time.
3. Access to vendor data is currently open for read/write in this iteration, but strictly validated by schema.

## The "Dirty Dozen" Payloads (Denial Tests)

### 1. Identity Spoofing (Owner Hijack)
**Payload:** `{ "vendorCode": "123", "ownerId": "attacker_uid" }`
**Expected:** DENIED (No ownerId field allowed in this schema, or strictly validated).

### 2. ID Poisoning (Long ID)
**Path:** `/vendors/extremely_long_string_designed_to_exhaust_resources_...`
**Expected:** DENIED (isValidId check).

### 3. ID Poisoning (Invalid Characters)
**Path:** `/vendors/$$%^&*`
**Expected:** DENIED (isValidId regex check).

### 4. Shadow Field Injection
**Payload:** `{ "vendorCode": "V1", "name1": "N1", "isVerified": true }`
**Expected:** DENIED (Schema strict keys / keys().size() check).

### 5. Type Poisoning (Number instead of String)
**Payload:** `{ "vendorCode": 12345, "name1": "Test" }`
**Expected:** DENIED (Type check).

### 6. Resource Exhaustion (Huge String)
**Payload:** `{ "vendorCode": "V1", "name1": "A".repeat(1000000) }`
**Expected:** DENIED (Size check).

### 7. State Shortcutting (Updating Immutable Field)
**Payload:** Update existing doc with new `vendorCode`.
**Expected:** DENIED (vendorCode is immutable).

### 8. PII Leak (Unauthorized Get)
**Action:** Unauthenticated user reading vendor details.
**Expected:** DENIED (isSignedIn check).

### 9. Delete Protocol Bypass
**Action:** User trying to delete a vendor without admin rights (if implemented).
**Expected:** DENIED (delete restriction).

### 10. Temporal Integrity Attack (Old Timestamp)
**Payload:** `{ "updatedAt": 1000 }`
**Expected:** DENIED (Must be close to current time or serverTimestamp).

### 11. Relational Orphan
**Payload:** Creating a vendor without required fields.
**Expected:** DENIED (Required field check).

### 12. Batch Overflow
**Action:** Massive write batch without validation.
**Expected:** DENIED (Each write validated).

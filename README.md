# Group 2: Pricing & Inventory - Product Edit Flow

This repository contains the completed 10-day internship task specification for Group 2. It implements a change-optimized Product Edit Flow containing two styled Polaris tabs (Pricing and Inventory) and integrates the `admin.product-details.action.render` Admin Extension using Preact and Polaris Web Components.

---

### 1. Change-Optimized Diff Strategy
To satisfy the core optimization principles of the specification:
* **Initial State Snapshot:** When the product page loads, the Loader queries the product details and returns a serialized payload. The original pricing metrics are stored on the client side inside the form.
* **Delta Computation:** On form submission, both the updated form fields and the JSON-serialized `originalState` snapshot are submitted to the Action.
* **Field Comparison:** The Action performs a field-by-field equality check (delta evaluation) to identify exact changes.
* **No-Op Save:** If no difference is detected between the submitted values and the original snapshot, the Action bypasses all Shopify API calls and returns a successful no-op response immediately without executing any GraphQL mutations (AC-05).

---

### 2. Mutation Decision Matrix (Conditions)
When changes are detected, only the necessary mutations are executed:

| Condition / Scope Changed | Shopify GraphQL Mutation Executed | No-Op? |
| :--- | :--- | :--- |
| **Pricing Fields Only** (Price, Compare-at Price, Cost per Item, Taxable, Tax Code) | `productVariantsBulkUpdate` (updating only the priced variant node) | No |
| **Inventory Fields Only** (Tracked status, SKU, Barcode, or Quantity Adjustments) | `productVariantUpdate` / `inventoryAdjustQuantities` (updating metadata and location-based increments) | No |
| **Both Pricing & Inventory Fields** | Both `productVariantsBulkUpdate` and inventory-related mutations are executed | No |
| **No Fields Changed** | None (Zero API requests run) | **YES** |

---

### 3. Verification & Acceptance Criteria Status
* [x] **AC-01 (UI Tabs):** Exactly two Polaris tabs rendered (Pricing & Inventory).
* [x] **AC-02 (Contracts):** Loader & Action successfully parse parameters and handle error registries.
* [x] **AC-03 (Pricing Persist):** Updates to Price, Compare-at Price, and Cost per Item save successfully.
* [x] **AC-04 (Inventory Adjustments):** Tracked status, SKU, Barcode, and Location stock metrics update per location context.
* [x] **AC-05 (No-Op Optimizations):** Unchanged saves fire zero mutations.
* [x] **AC-06 (Price Validation):** Validates that Compare-at Price must be greater than Price (throws E-10).
* [x] **AC-07 (Lazy-Loading):** The Inventory Tab is loaded dynamically on selection using query-parameter routing.
* [x] **AC-08 (Error Registry):** All user-facing error messages E-01 to E-10 match the spec verbatim.
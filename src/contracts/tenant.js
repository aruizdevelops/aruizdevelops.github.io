/**
 * @typedef {Object} TenantManifest
 * @property {string} id - Unique tenant identifier
 * @property {string} name - Display name
 * @property {string} businessType - One of BUSINESS_TYPES
 * @property {string|null} logo - Logo URL or null for text fallback
 * @property {Object} theme - MUI theme overrides passed to createCoreTheme
 * @property {Object} features - Feature flags (e.g., { hasMenu, hasBooking, hasCheckout })
 * @property {Object} [booking] - Booking workflow config (optional)
 * @property {Object} [checkout] - Checkout workflow config (optional)
 * @property {Object} content - Landing page content sections
 * @property {Object} contact - Contact info (phone, email, address)
 * @property {Object} [hours] - Business hours (optional)
 */

export const BUSINESS_TYPES = {
  SERVICE: 'service',
  RETAIL: 'retail',
  FOOD: 'food',
  CONSULTING: 'consulting',
};

export const REQUIRED_MANIFEST_FIELDS = ['id', 'name', 'businessType', 'theme'];

const VALID_BUSINESS_TYPES = Object.values(BUSINESS_TYPES);

/**
 * Validates a tenant manifest object.
 * @param {Object} manifest
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateTenantManifest(manifest) {
  const errors = [];

  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return { valid: false, errors: ['manifest must be an object'] };
  }

  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (manifest[field] === undefined || manifest[field] === null || manifest[field] === '') {
      errors.push(`${field} is required`);
    }
  }

  // If required fields are missing, return early before type checks
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  if (typeof manifest.id !== 'string' || manifest.id.trim() === '') {
    errors.push('id must be a non-empty string');
  }

  if (typeof manifest.name !== 'string' || manifest.name.trim() === '') {
    errors.push('name must be a non-empty string');
  }

  if (!VALID_BUSINESS_TYPES.includes(manifest.businessType)) {
    errors.push(
      `businessType must be one of: ${VALID_BUSINESS_TYPES.join(', ')}`
    );
  }

  if (typeof manifest.theme !== 'object' || manifest.theme === null || Array.isArray(manifest.theme)) {
    errors.push('theme must be an object');
  }

  if (manifest.features !== undefined) {
    if (typeof manifest.features !== 'object' || manifest.features === null || Array.isArray(manifest.features)) {
      errors.push('features must be an object');
    }
  }

  if (manifest.contact !== undefined) {
    if (typeof manifest.contact !== 'object' || manifest.contact === null || Array.isArray(manifest.contact)) {
      errors.push('contact must be an object');
    }
  }

  return { valid: errors.length === 0, errors };
}

import { validateTenantManifest } from '../contracts/tenant';

/**
 * Validates that required config fields are present.
 * Delegates to validateTenantManifest for backward compatibility.
 */
export function validateTenantConfig(config) {
  return validateTenantManifest(config);
}

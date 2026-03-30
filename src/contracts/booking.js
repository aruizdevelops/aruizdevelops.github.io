/**
 * @typedef {Object} BookableService
 * @property {string} id
 * @property {string} name
 * @property {number} durationMinutes
 * @property {number} price
 * @property {string} [category]
 * @property {Object} [metadata]
 */

/**
 * @typedef {Object} TimeSlot
 * @property {string} start - ISO 8601 datetime
 * @property {string} end - ISO 8601 datetime
 * @property {boolean} available
 * @property {string} [providerId]
 */

/**
 * @typedef {Object} BookingConfig
 * @property {boolean} [requiresDeposit]
 * @property {number} [depositAmount]
 * @property {boolean} [allowStaffSelection]
 * @property {boolean} [allowMultiService]
 * @property {number} [cancellationWindowHours]
 * @property {number} [maxAdvanceBookingDays]
 * @property {string[]} [bookingSteps] - Ordered array of BOOKING_STEPS values
 */

/**
 * Booking workflow step constants.
 */
export const BOOKING_STEPS = {
  SERVICE_SELECT: 'service_select',
  STAFF_SELECT: 'staff_select',
  DATE_TIME: 'date_time',
  CUSTOMER_INFO: 'customer_info',
  CONFIRMATION: 'confirmation',
};

export const DEFAULT_BOOKING_STEPS = [
  BOOKING_STEPS.SERVICE_SELECT,
  BOOKING_STEPS.DATE_TIME,
  BOOKING_STEPS.CUSTOMER_INFO,
  BOOKING_STEPS.CONFIRMATION,
];

const VALID_BOOKING_STEPS = Object.values(BOOKING_STEPS);

/**
 * Validates a booking config object.
 * @param {Object} config
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateBookingConfig(config) {
  const errors = [];

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { valid: false, errors: ['config must be an object'] };
  }

  if (config.bookingSteps !== undefined) {
    if (!Array.isArray(config.bookingSteps) || config.bookingSteps.length === 0) {
      errors.push('bookingSteps must be a non-empty array');
    } else {
      for (const step of config.bookingSteps) {
        if (!VALID_BOOKING_STEPS.includes(step)) {
          errors.push(`invalid booking step: ${step}`);
        }
      }
    }
  }

  if (config.depositAmount !== undefined) {
    if (typeof config.depositAmount !== 'number' || config.depositAmount <= 0) {
      errors.push('depositAmount must be a positive number');
    }
  }

  if (config.cancellationWindowHours !== undefined) {
    if (typeof config.cancellationWindowHours !== 'number' || config.cancellationWindowHours < 0) {
      errors.push('cancellationWindowHours must be a non-negative number');
    }
  }

  if (config.maxAdvanceBookingDays !== undefined) {
    if (typeof config.maxAdvanceBookingDays !== 'number' || config.maxAdvanceBookingDays <= 0) {
      errors.push('maxAdvanceBookingDays must be a positive number');
    }
  }

  return { valid: errors.length === 0, errors };
}

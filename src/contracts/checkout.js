/**
 * @typedef {Object} CartItem
 * @property {string} id
 * @property {string} name
 * @property {number} quantity
 * @property {number} unitPrice
 * @property {Object} [metadata]
 */

/**
 * @typedef {Object} CheckoutConfig
 * @property {boolean} [requiresShipping]
 * @property {boolean} [allowTips]
 * @property {boolean} [allowPromos]
 * @property {string[]} [paymentMethods] - e.g., ['card', 'cash']
 * @property {string} [currency] - ISO 4217 code, defaults to 'USD'
 * @property {string[]} [checkoutSteps] - Ordered array of CHECKOUT_STEPS values
 */

export const CHECKOUT_STEPS = {
  CART: 'cart',
  CUSTOMER_INFO: 'customer_info',
  SHIPPING: 'shipping',
  PAYMENT: 'payment',
  CONFIRMATION: 'confirmation',
};

export const DEFAULT_CHECKOUT_STEPS = [
  CHECKOUT_STEPS.CART,
  CHECKOUT_STEPS.CUSTOMER_INFO,
  CHECKOUT_STEPS.PAYMENT,
  CHECKOUT_STEPS.CONFIRMATION,
];

const VALID_CHECKOUT_STEPS = Object.values(CHECKOUT_STEPS);

/**
 * Validates a checkout config object.
 * @param {Object} config
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCheckoutConfig(config) {
  const errors = [];

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return { valid: false, errors: ['config must be an object'] };
  }

  if (config.checkoutSteps !== undefined) {
    if (!Array.isArray(config.checkoutSteps) || config.checkoutSteps.length === 0) {
      errors.push('checkoutSteps must be a non-empty array');
    } else {
      for (const step of config.checkoutSteps) {
        if (!VALID_CHECKOUT_STEPS.includes(step)) {
          errors.push(`invalid checkout step: ${step}`);
        }
      }
    }
  }

  if (config.paymentMethods !== undefined) {
    if (!Array.isArray(config.paymentMethods) || config.paymentMethods.length === 0) {
      errors.push('paymentMethods must be a non-empty array');
    } else {
      for (const method of config.paymentMethods) {
        if (typeof method !== 'string') {
          errors.push('each paymentMethod must be a string');
          break;
        }
      }
    }
  }

  if (config.currency !== undefined) {
    if (typeof config.currency !== 'string' || config.currency.trim() === '') {
      errors.push('currency must be a non-empty string');
    }
  }

  return { valid: errors.length === 0, errors };
}

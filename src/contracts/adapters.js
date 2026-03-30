/**
 * @typedef {Object} PaymentAdapter
 * @property {function(Object): Promise<{id: string, clientSecret: string}>} createIntent
 * @property {function(string): Promise<{success: boolean}>} confirmPayment
 * @property {function(string): Promise<{success: boolean}>} cancelPayment
 */

/**
 * @typedef {Object} SchedulingAdapter
 * @property {function(string, string): Promise<TimeSlot[]>} getAvailableSlots - (serviceId, date) => slots
 * @property {function(Object): Promise<{id: string, status: string}>} createBooking
 * @property {function(string): Promise<{success: boolean}>} cancelBooking
 */

/**
 * @typedef {Object} NotificationAdapter
 * @property {function(Object): Promise<void>} sendConfirmation
 * @property {function(Object): Promise<void>} sendReminder
 * @property {function(Object): Promise<void>} sendCancellation
 */

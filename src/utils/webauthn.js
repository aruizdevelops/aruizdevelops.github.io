const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function bytesToBinary(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return binary;
}

export function bufferToBase64url(buffer) {
  if (buffer == null) return '';
  const bytes =
    buffer instanceof ArrayBuffer
      ? new Uint8Array(buffer)
      : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const encode = typeof btoa === 'function' ? btoa : encodeBase64;
  return encode(bytesToBinary(bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function encodeBase64(binary) {
  let result = '';
  for (let i = 0; i < binary.length; i += 3) {
    const a = binary.charCodeAt(i);
    const b = i + 1 < binary.length ? binary.charCodeAt(i + 1) : 0;
    const c = i + 2 < binary.length ? binary.charCodeAt(i + 2) : 0;
    const triple = (a << 16) | (b << 8) | c;
    result += BASE64_CHARS[(triple >> 18) & 63];
    result += BASE64_CHARS[(triple >> 12) & 63];
    result += i + 1 < binary.length ? BASE64_CHARS[(triple >> 6) & 63] : '=';
    result += i + 2 < binary.length ? BASE64_CHARS[triple & 63] : '=';
  }
  return result;
}

function decodeBase64(value) {
  if (typeof atob === 'function') return atob(value);
  const cleaned = value.replace(/[^A-Za-z0-9+/]/g, '');
  const lookup = new Uint8Array(256);
  for (let i = 0; i < BASE64_CHARS.length; i += 1) {
    lookup[BASE64_CHARS.charCodeAt(i)] = i;
  }
  let binary = '';
  for (let i = 0; i < cleaned.length; i += 4) {
    const n =
      (lookup[cleaned.charCodeAt(i)] << 18) |
      (lookup[cleaned.charCodeAt(i + 1)] << 12) |
      (lookup[cleaned.charCodeAt(i + 2)] << 6) |
      lookup[cleaned.charCodeAt(i + 3)];
    binary += String.fromCharCode((n >> 16) & 255);
    if (cleaned[i + 2] && cleaned[i + 2] !== '=') {
      binary += String.fromCharCode((n >> 8) & 255);
    }
    if (cleaned[i + 3] && cleaned[i + 3] !== '=') {
      binary += String.fromCharCode(n & 255);
    }
  }
  return binary;
}

export function base64urlToBuffer(value) {
  if (value instanceof ArrayBuffer) return value;
  if (ArrayBuffer.isView(value)) {
    return value.buffer.slice(
      value.byteOffset,
      value.byteOffset + value.byteLength,
    );
  }
  if (typeof value !== 'string' || !value) {
    throw new Error('invalid-base64');
  }
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const pad = '='.repeat((4 - (normalized.length % 4)) % 4);
  const raw = decodeBase64(normalized + pad);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes.buffer;
}

export function unwrapPublicKeyOptions(payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.publicKey?.challenge) return payload.publicKey;
  if (payload.options?.publicKey?.challenge) return payload.options.publicKey;
  if (payload.options?.challenge) return payload.options;
  if (payload.challenge) return payload;
  return null;
}

function convertDescriptor(descriptor) {
  if (!descriptor || typeof descriptor !== 'object') return descriptor;
  return {
    ...descriptor,
    id: base64urlToBuffer(descriptor.id),
  };
}

export function toCreationOptions(optionsJSON) {
  const options = unwrapPublicKeyOptions(optionsJSON) || optionsJSON;
  if (!options?.challenge) {
    throw new Error('webauthn-options-missing-challenge');
  }

  const publicKey = {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
  };

  if (options.user) {
    publicKey.user = {
      ...options.user,
      id: base64urlToBuffer(options.user.id),
    };
  }

  if (Array.isArray(options.excludeCredentials)) {
    publicKey.excludeCredentials = options.excludeCredentials.map(
      convertDescriptor,
    );
  }

  return { publicKey };
}

export function toRequestOptions(optionsJSON) {
  const options = unwrapPublicKeyOptions(optionsJSON) || optionsJSON;
  if (!options?.challenge) {
    throw new Error('webauthn-options-missing-challenge');
  }

  const publicKey = {
    ...options,
    challenge: base64urlToBuffer(options.challenge),
  };

  if (Array.isArray(options.allowCredentials) && options.allowCredentials.length) {
    publicKey.allowCredentials = options.allowCredentials.map(convertDescriptor);
  } else {
    delete publicKey.allowCredentials;
  }

  return { publicKey };
}

function optionalBufferField(value) {
  if (!value) return undefined;
  return bufferToBase64url(value);
}

export function credentialToJSON(credential) {
  if (!credential) return null;
  const { response } = credential;
  const json = {
    id: credential.id,
    rawId: bufferToBase64url(credential.rawId),
    type: credential.type || 'public-key',
    clientExtensionResults: credential.getClientExtensionResults?.() || {},
    response: {
      clientDataJSON: bufferToBase64url(response.clientDataJSON),
    },
  };

  if (credential.authenticatorAttachment) {
    json.authenticatorAttachment = credential.authenticatorAttachment;
  }

  if (response.attestationObject) {
    json.response.attestationObject = bufferToBase64url(response.attestationObject);
  }
  if (typeof response.getTransports === 'function') {
    json.response.transports = response.getTransports();
  }
  if (typeof response.getPublicKeyAlgorithm === 'function') {
    json.response.publicKeyAlgorithm = response.getPublicKeyAlgorithm();
  }

  const authenticatorData =
    response.authenticatorData ||
    (typeof response.getAuthenticatorData === 'function'
      ? response.getAuthenticatorData()
      : null);
  const encodedAuthenticatorData = optionalBufferField(authenticatorData);
  if (encodedAuthenticatorData) {
    json.response.authenticatorData = encodedAuthenticatorData;
  }

  if (response.signature) {
    json.response.signature = bufferToBase64url(response.signature);
  }

  if (response.userHandle) {
    json.response.userHandle = bufferToBase64url(response.userHandle);
  }

  return json;
}

export function isWebAuthnSupported() {
  return (
    typeof window !== 'undefined' &&
    typeof window.PublicKeyCredential === 'function' &&
    typeof navigator !== 'undefined' &&
    Boolean(navigator.credentials) &&
    typeof navigator.credentials.create === 'function' &&
    typeof navigator.credentials.get === 'function'
  );
}

export async function createCredential(optionsJSON) {
  if (!isWebAuthnSupported()) {
    throw new Error('webauthn-unsupported');
  }
  const credential = await navigator.credentials.create(
    toCreationOptions(optionsJSON),
  );
  if (!credential) {
    const cancelled = new Error('webauthn-create-cancelled');
    cancelled.name = 'NotAllowedError';
    throw cancelled;
  }
  return credentialToJSON(credential);
}

export async function getCredential(optionsJSON) {
  if (!isWebAuthnSupported()) {
    throw new Error('webauthn-unsupported');
  }
  const credential = await navigator.credentials.get(
    toRequestOptions(optionsJSON),
  );
  if (!credential) {
    const cancelled = new Error('webauthn-get-cancelled');
    cancelled.name = 'NotAllowedError';
    throw cancelled;
  }
  return credentialToJSON(credential);
}

export function webAuthnErrorMessage(error) {
  const name = error?.name || '';
  const message = error?.message || '';

  if (message === 'webauthn-unsupported' || name === 'NotSupportedError') {
    return "This browser does not support Face ID / Touch ID passkeys. Open this page in Safari or Chrome on Allen's phone.";
  }
  if (name === 'NotAllowedError' || message.includes('cancelled')) {
    return 'Cancelled. Tap Unlock with Face ID / Touch ID to try again.';
  }
  if (name === 'InvalidStateError') {
    return 'This device is already registered. Tap Unlock with Face ID / Touch ID.';
  }
  if (name === 'SecurityError') {
    return 'Passkeys need a secure browser on this site (https://aruizdevelops.github.io).';
  }
  if (message === 'webauthn-options-missing-challenge') {
    return 'The passkey service did not return a challenge. Try again in a moment.';
  }
  if (name === 'AbortError') {
    return 'Passkey prompt closed. Tap Unlock with Face ID / Touch ID to try again.';
  }
  return 'Could not complete Face ID / Touch ID. Try again.';
}

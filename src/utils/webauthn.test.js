import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  base64urlToBuffer,
  bufferToBase64url,
  credentialToJSON,
  toCreationOptions,
  toRequestOptions,
  unwrapPublicKeyOptions,
} from './webauthn.js';

describe('webauthn encoding', () => {
  it('round-trips bytes through base64url', () => {
    const bytes = Uint8Array.from([0, 1, 2, 250, 255]);
    const encoded = bufferToBase64url(bytes);
    assert.equal(encoded.includes('+'), false);
    assert.equal(encoded.includes('/'), false);
    const decoded = new Uint8Array(base64urlToBuffer(encoded));
    assert.deepEqual([...decoded], [...bytes]);
  });

  it('accepts standard base64 as well as base64url', () => {
    const encoded = bufferToBase64url(Uint8Array.from([0xff, 0xee, 0xdd]));
    const asB64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const fromUrl = new Uint8Array(base64urlToBuffer(encoded));
    const fromB64 = new Uint8Array(base64urlToBuffer(asB64));
    assert.deepEqual([...fromUrl], [...fromB64]);
  });
});

describe('unwrapPublicKeyOptions', () => {
  const challenge = bufferToBase64url(Uint8Array.from([9, 8, 7]));

  it('accepts a bare options object', () => {
    const options = unwrapPublicKeyOptions({ challenge, rpId: 'example.test' });
    assert.equal(options.challenge, challenge);
  });

  it('unwraps { publicKey } and { options }', () => {
    assert.equal(
      unwrapPublicKeyOptions({ publicKey: { challenge } }).challenge,
      challenge,
    );
    assert.equal(
      unwrapPublicKeyOptions({ options: { challenge } }).challenge,
      challenge,
    );
    assert.equal(
      unwrapPublicKeyOptions({
        options: { publicKey: { challenge } },
      }).challenge,
      challenge,
    );
  });

  it('returns null when challenge is missing', () => {
    assert.equal(unwrapPublicKeyOptions({ ok: true }), null);
  });
});

describe('toCreationOptions / toRequestOptions', () => {
  it('converts challenge, user.id, and excludeCredentials to ArrayBuffers', () => {
    const challenge = bufferToBase64url(Uint8Array.from([1, 2, 3, 4]));
    const userId = bufferToBase64url(Uint8Array.from([5, 6]));
    const credId = bufferToBase64url(Uint8Array.from([7, 8, 9]));
    const { publicKey } = toCreationOptions({
      challenge,
      rp: { id: 'aruizdevelops.github.io', name: 'Texas Craft Sites' },
      user: { id: userId, name: 'allen', displayName: 'Allen' },
      excludeCredentials: [{ type: 'public-key', id: credId }],
    });
    assert.equal(publicKey.challenge instanceof ArrayBuffer, true);
    assert.equal(publicKey.user.id instanceof ArrayBuffer, true);
    assert.equal(publicKey.excludeCredentials[0].id instanceof ArrayBuffer, true);
    assert.deepEqual(
      [...new Uint8Array(publicKey.challenge)],
      [1, 2, 3, 4],
    );
    assert.equal(publicKey.rp.id, 'aruizdevelops.github.io');
  });

  it('omits empty allowCredentials so platform passkeys can be discovered', () => {
    const challenge = bufferToBase64url(Uint8Array.from([1]));
    const { publicKey } = toRequestOptions({
      challenge,
      rpId: 'aruizdevelops.github.io',
      allowCredentials: [],
    });
    assert.equal('allowCredentials' in publicKey, false);
  });

  it('converts the live proxy register/options shape and drops challenge_id', () => {
    const live = {
      rp: { name: 'Texas Craft Sites Approval', id: 'aruizdevelops.github.io' },
      user: {
        id: 'rxNWYz95yrEK8iJA_aoXOykIJQq6i6uInIjvb9lAv5s',
        name: 'allen',
        displayName: 'Allen Ruiz',
      },
      challenge:
        'Hr99XHUo2P_2X63mD-fIOzJs_ulfZT6HQbTawrm9qs5hrvVdQpTk2smMEwe-cnuLjaHIcMQHONk_Ef5Tj1bPzQ',
      pubKeyCredParams: [
        { type: 'public-key', alg: -8 },
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      timeout: 60000,
      excludeCredentials: [],
      authenticatorSelection: {
        residentKey: 'preferred',
        requireResidentKey: false,
        userVerification: 'preferred',
      },
      attestation: 'none',
      challenge_id: 'RQV0YYdkWa69N5Gs',
    };
    const { publicKey } = toCreationOptions(live);
    assert.equal(publicKey.rp.id, 'aruizdevelops.github.io');
    assert.equal(publicKey.challenge instanceof ArrayBuffer, true);
    assert.equal(publicKey.user.id instanceof ArrayBuffer, true);
    assert.equal('challenge_id' in publicKey, false);
    assert.equal('excludeCredentials' in publicKey, false);
    assert.equal(publicKey.authenticatorSelection.userVerification, 'preferred');
  });
});

describe('credentialToJSON', () => {
  it('serializes attestation credentials to SimpleWebAuthn JSON', () => {
    const json = credentialToJSON({
      id: 'cred-1',
      rawId: Uint8Array.from([10, 11]),
      type: 'public-key',
      authenticatorAttachment: 'platform',
      getClientExtensionResults: () => ({ credProps: { rk: true } }),
      response: {
        clientDataJSON: Uint8Array.from([1]),
        attestationObject: Uint8Array.from([2, 3]),
        getTransports: () => ['internal'],
      },
    });
    assert.equal(json.id, 'cred-1');
    assert.equal(json.type, 'public-key');
    assert.equal(json.authenticatorAttachment, 'platform');
    assert.equal(json.response.transports[0], 'internal');
    assert.equal(typeof json.response.clientDataJSON, 'string');
    assert.equal(typeof json.response.attestationObject, 'string');
  });
});

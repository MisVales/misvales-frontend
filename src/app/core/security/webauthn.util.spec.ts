import { arrayBufferToBase64Url, base64UrlToArrayBuffer } from './webauthn.util';

describe('WebAuthn Base64URL', () => {
  it('round-trips bytes without padding or unsafe URL characters', () => {
    const source = Uint8Array.from([0, 1, 2, 250, 251, 252, 253, 254, 255]).buffer;
    const encoded = arrayBufferToBase64Url(source);

    expect(encoded).not.toMatch(/[+/=]/u);
    expect(Array.from(new Uint8Array(base64UrlToArrayBuffer(encoded)))).toEqual([
      0, 1, 2, 250, 251, 252, 253, 254, 255,
    ]);
  });
});

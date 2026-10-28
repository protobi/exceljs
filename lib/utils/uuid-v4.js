'use strict';

const crypto = require('crypto');

/**
 * RFC 4122 version 4 UUID from crypto.randomBytes.
 * randomBytes exists in every supported Node version and in the crypto-browserify
 * shim the browser bundle already contains (see encryptor.js), unlike crypto.randomUUID.
 * @returns {string} e.g. '0f8fad5b-d9cb-469f-a165-70867728950e'
 */
function uuidv4() {
  const bytes = crypto.randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  const hex = bytes.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

module.exports = uuidv4;

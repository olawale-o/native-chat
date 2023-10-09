const Crypto = require('crypto');
const { ENCRYPTION_KEY, ENCRYPTION_IV, ENCRYPTION_ALGORITHM } = require('../../config') 

const key = Crypto.createHash('sha512').update(ENCRYPTION_KEY).digest('hex').substring(0, 32);
const encryptionIV = Crypto.createHash('sha512').update(ENCRYPTION_IV).digest('hex').substring(0, 16);

exports.encryptData = (data) => {
  const cipher = Crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, encryptionIV);
  return Buffer.from(
    cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
  ).toString('base64');
};

// Decrypt data
exports.decryptData = (encryptedData) => {
  const buff = Buffer.from(encryptedData, 'base64');
  const decipher = Crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, encryptionIV);
  return (
    decipher.update(buff.toString('utf8'), 'hex', 'utf8')
      + decipher.final('utf8')
  );
};
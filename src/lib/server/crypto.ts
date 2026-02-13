import { env } from '$env/dynamic/private';
import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

/**
 * Derive a 32-byte key from the ENCRYPTION_KEY env variable.
 * Uses SHA-256 hash so any length string works as the env var.
 */
function getKey(): Buffer {
	if (!env.ENCRYPTION_KEY) {
		throw new Error('ENCRYPTION_KEY environment variable is not set');
	}
	return createHash('sha256').update(env.ENCRYPTION_KEY).digest();
}

/**
 * Encrypt a plaintext string.
 * Returns a string in the format: iv:authTag:ciphertext (all hex-encoded)
 */
export function encrypt(plaintext: string): string {
	const key = getKey();
	const iv = randomBytes(16);
	const cipher = createCipheriv(ALGORITHM, key, iv);

	let encrypted = cipher.update(plaintext, 'utf8', 'hex');
	encrypted += cipher.final('hex');

	const authTag = cipher.getAuthTag().toString('hex');

	return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt a string that was encrypted with encrypt().
 * Expects format: iv:authTag:ciphertext (all hex-encoded)
 */
export function decrypt(encryptedString: string): string {
	const key = getKey();
	const [ivHex, authTagHex, ciphertext] = encryptedString.split(':');

	if (!ivHex || !authTagHex || !ciphertext) {
		throw new Error('Invalid encrypted string format');
	}

	const iv = Buffer.from(ivHex, 'hex');
	const authTag = Buffer.from(authTagHex, 'hex');
	const decipher = createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(authTag);

	let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
	decrypted += decipher.final('utf8');

	return decrypted;
}

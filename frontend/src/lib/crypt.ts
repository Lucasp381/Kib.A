function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = Buffer.from(base64, 'base64');
  return binary.buffer.slice(binary.byteOffset, binary.byteOffset + binary.byteLength);
}
export async function encrypt(text: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const rawKey = base64ToArrayBuffer(key);
  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["encrypt"]);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedText = encoder.encode(text);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, encodedText);

  // Buffer.concat IV + encrypted
  const buffer = new Uint8Array(iv.length + encrypted.byteLength);
  buffer.set(iv, 0);
  buffer.set(new Uint8Array(encrypted), iv.length);

  return Buffer.from(buffer).toString("base64");
}

export async function decrypt(encryptedText: string, key: string): Promise<string> {
  const decoder = new TextDecoder();
  const rawKey = base64ToArrayBuffer(key);

  const data = Buffer.from(encryptedText, "base64");
  if (data.length < 12 + 16) throw new Error("Données trop petites pour contenir IV + tag");

  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);

  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertext);

  return decoder.decode(new Uint8Array(decrypted));
}

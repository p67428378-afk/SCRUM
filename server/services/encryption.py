import base64
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from server.config import settings


def get_encryption_key() -> bytes:
    """
    Retrieve and decode the AES-256 encryption key from settings.
    Ensures the key is exactly 32 bytes.
    """
    try:
        key_bytes = base64.b64decode(settings.ENCRYPTION_KEY)
        if len(key_bytes) == 32:
            return key_bytes
    except Exception:
        pass

    # Fallback/deterministic key generation if the configured key is invalid
    # We hash the key string to get a consistent 32-byte key
    import hashlib

    return hashlib.sha256(settings.ENCRYPTION_KEY.encode("utf-8")).digest()


def encrypt_data(data: bytes) -> bytes:
    """
    Encrypt data using AES-256-GCM.
    Returns nonce + ciphertext.
    """
    key = get_encryption_key()
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)  # 12-byte nonce for GCM
    ciphertext = aesgcm.encrypt(nonce, data, None)
    return nonce + ciphertext


def decrypt_data(encrypted_data: bytes) -> bytes:
    """
    Decrypt data using AES-256-GCM.
    Expects nonce (first 12 bytes) + ciphertext.
    """
    key = get_encryption_key()
    aesgcm = AESGCM(key)
    nonce = encrypted_data[:12]
    ciphertext = encrypted_data[12:]
    return aesgcm.decrypt(nonce, ciphertext, None)

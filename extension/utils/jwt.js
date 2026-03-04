// ── JWT Decode ───────────────────────────────────────────────────────────────

function decodeJWT(token) {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid JWT: expected 3 parts (header.payload.signature)' };
    }

    const decodeBase64Url = (str) => {
      // Replace URL-safe chars and add padding
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) base64 += '=';
      return JSON.parse(decodeURIComponent(escape(atob(base64))));
    };

    const header = decodeBase64Url(parts[0]);
    const payload = decodeBase64Url(parts[1]);

    // Decode expiry/issued times
    const times = {};
    if (payload.exp) {
      const d = new Date(payload.exp * 1000);
      times.exp = d.toISOString();
      times.expired = d < new Date();
    }
    if (payload.iat) {
      times.iat = new Date(payload.iat * 1000).toISOString();
    }
    if (payload.nbf) {
      times.nbf = new Date(payload.nbf * 1000).toISOString();
    }

    return { header, payload, signature: parts[2], times, error: null };
  } catch (e) {
    return { error: 'Invalid JWT: ' + (e.message || 'could not decode') };
  }
}

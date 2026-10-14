// lib/analytics/gaClientId.js — the GA client_id sent with an order so the server can
// attribute the purchase. Falls back to the _ga cookie, then to our own session id.

// Helper function to get or create custom session ID
function getOrCreateSessionId() {
  if (typeof window === 'undefined') {
    console.log('[Session ID] Running on server, skipping');
    return null;
  }

  const SESSION_COOKIE_NAME = 'fil_session_id';
  const match = document.cookie.match(new RegExp(`(^| )${SESSION_COOKIE_NAME}=([^;]+)`));

  if (match) {
    const sessionId = match[2];
    console.log('[Session ID] Found existing session ID:', sessionId);
    return sessionId;
  }

  // Generate new session ID
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  console.log('[Session ID] Generated new session ID:', sessionId);

  // Set cookie for 30 days
  document.cookie = `${SESSION_COOKIE_NAME}=${sessionId}; path=/; max-age=2592000; SameSite=Lax`;

  return sessionId;
}

// Helper function to get GA client_id from _ga cookie (fallback)
function getGAClientIdFromCookie() {
  if (typeof window === 'undefined') {
    console.log('[GA Cookie] Running on server, skipping cookie read');
    return null;
  }
  console.log('[GA Cookie] All cookies:', document.cookie);
  const match = document.cookie.match(/_ga=GA\d+\.\d+\.(\d+\.\d+)/);
  const clientId = match ? match[1] : null;
  console.log('[GA Cookie] Client ID from _ga cookie:', clientId);
  return clientId;
}

// Helper function to get GA client_id with timeout and fallback
export async function getGAClientId(preferences, status) {
  try {
    // Check if analytics consent is given
    const canTrack = status === 'accepted' ||
                     (status === 'customized' && preferences.analytics);

    if (!canTrack) {
      console.log('[GA] Analytics consent not given, using custom session ID');
      const sessionId = getOrCreateSessionId();
      return sessionId; // Use custom session ID as fallback
    }

    console.log('[GA] Analytics consent given, attempting gtag method');
    console.log('[GA] GA ID:', process.env.NEXT_PUBLIC_GA_ID);
    console.log('[GA] window.gtag available:', typeof window.gtag);

    const clientId = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.log('[GA] gtag timeout, trying cookie fallback');
        reject(new Error('GA timeout'));
      }, 3000);

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('get', process.env.NEXT_PUBLIC_GA_ID, 'client_id', (clientId) => {
          clearTimeout(timeout);
          console.log('[GA] Raw client_id received from gtag:', clientId);
          resolve(clientId);
        });
      } else {
        clearTimeout(timeout);
        console.log('[GA] gtag not available, trying cookie fallback');
        reject(new Error('GA not available'));
      }
    });

    if (clientId) {
      console.log('[GA] Successfully captured client_id via gtag:', clientId);
      return clientId;
    } else {
      console.log('[GA] gtag returned null, using GA cookie fallback');
      const cookieClientId = getGAClientIdFromCookie();
      return cookieClientId || getOrCreateSessionId();
    }
  } catch (error) {
    console.warn('[GA] gtag method failed:', error.message, 'trying fallback chain');
    // Fallback chain: GA cookie -> custom session ID
    const cookieClientId = getGAClientIdFromCookie();
    if (cookieClientId) {
      console.log('[GA] Cookie fallback successful:', cookieClientId);
      return cookieClientId;
    }
    console.log('[GA] Cookie fallback failed, using custom session ID');
    return getOrCreateSessionId();
  }
}

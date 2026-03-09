export function logApiError(context, details = {}) {
  if (typeof console !== "undefined" && console.error) {
    console.error(`[API ERROR] ${context}`, details);
  }
}

export async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch (error) {
    logApiError("Invalid JSON response", {
      url: response?.url,
      status: response?.status,
      statusText: response?.statusText,
      error: error?.message || error,
    });
    return null;
  }
}

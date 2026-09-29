/** Kein RevenueCat. Dieser Aufruf bucht nie etwas ab. */
export const PURCHASES_CONNECTED = false;

export function purchasePack(_productId: string): { ok: false; reason: 'not_connected' } {
  return { ok: false, reason: 'not_connected' };
}

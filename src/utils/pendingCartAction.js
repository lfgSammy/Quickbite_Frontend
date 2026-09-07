const KEY = 'quickbite_pending_cart_action';

/**
 * A guest who customizes an item and taps "Add to cart" / "Buy Now" gets sent
 * to log in first. Their selections live in component state, which a full-page
 * redirect (Google sign-in) or a remount (email login) wipes - so stash the
 * finished payload here and replay it once they're back and signed in.
 *
 * sessionStorage rather than in-memory state because the Google flow leaves
 * the origin entirely and comes back on a fresh page load.
 */
export function savePendingCartAction({ menuItemId, payload, redirectTo, action }) {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ menuItemId: String(menuItemId), payload, redirectTo, action })
    );
  } catch {
    // Private mode / storage disabled - the customer just re-picks. Not fatal.
  }
}

/**
 * Returns the stashed action only if it belongs to `menuItemId`, and clears it
 * either way so a stale stash can't fire on an unrelated item later.
 */
export function consumePendingCartAction(menuItemId) {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;

    const pending = JSON.parse(raw);
    sessionStorage.removeItem(KEY);

    if (pending?.menuItemId !== String(menuItemId)) return null;
    return pending;
  } catch {
    return null;
  }
}

export function clearPendingCartAction() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // nothing to do
  }
}

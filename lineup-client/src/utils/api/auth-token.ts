type GetTokenFn = () => Promise<string>;

let _getToken: GetTokenFn | null = null;

let _resolve: ((fn: GetTokenFn) => void) | null = null;
const _ready = new Promise<GetTokenFn>((resolve) => {
  _resolve = resolve;
});

export function registerGetToken(fn: GetTokenFn) {
  _getToken = fn;
  _resolve?.(fn); // unblocks any getToken() calls that are waiting
}

export async function getToken(): Promise<string | null> {
  // if already registered, return immediately
  if (_getToken) return _getToken();

  // otherwise, wait for registration
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
  const fn = await Promise.race([_ready, timeout]);

  if (!fn) return null; // timed out
  return fn();
}

type GetTokenFn = () => Promise<string>;
type LogoutFn = (options?: { logoutParams?: { returnTo?: string } }) => Promise<void>;

let _getToken: GetTokenFn | null = null;

let _resolveToken: ((fn: GetTokenFn) => void) | null = null;
const _tokenReady = new Promise<GetTokenFn>((resolve) => {
  _resolveToken = resolve;
});

export function registerGetToken(fn: GetTokenFn) {
  _getToken = fn;
  _resolveToken?.(fn); // unblocks any getToken() calls that are waiting
}

export async function getToken(): Promise<string | null> {
  // if already registered, return immediately
  if (_getToken) return _getToken();

  // otherwise, wait for registration
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
  const fn = await Promise.race([_tokenReady, timeout]);

  if (!fn) return null; // timed out
  return fn();
}

let _logout: LogoutFn | null = null;

export function registerLogout(fn: LogoutFn) {
  _logout = fn;
}

export async function logout(options?: { logoutParams?: { returnTo?: string } }) {
  if (!_logout) {
    console.warn("logout called before registerLogout");
    return;
  }
  return _logout(options);
}

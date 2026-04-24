/** The type of the function that gets a token. */
export type GetTokenFn = () => Promise<string>;

/** The type of the logout function. */
export type LogoutFn = (options?: { logoutParams?: { returnTo?: string } }) => Promise<void>;

let _getToken: GetTokenFn | null = null;

let _resolveToken: ((fn: GetTokenFn) => void) | null = null;
const _tokenReady = new Promise<GetTokenFn>((resolve) => {
  _resolveToken = resolve;
});

/** Register a [getAccessTokenSilently (auth0)](https://auth0.github.io/auth0-react/functions/useAuth0.html) function for use in loaders, which can't use hooks. */
export function registerGetToken(fn: GetTokenFn) {
  _getToken = fn;
  _resolveToken?.(fn); // unblocks any getToken() calls that are waiting
}

/** Returns a token once {@link registerGetToken} has been successfully called.
 * @returns A user's JWT token.
 * @remarks To be used ONLY in a place where hooks are not available (i.e. in loaders).
 */
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

/** Register a [logout (auth0)](https://auth0.github.io/auth0-react/functions/useAuth0.html) function for use in loaders, which can't use hooks. */
export function registerLogout(fn: LogoutFn) {
  _logout = fn;
}

/** Logs the user out once {@link registerLogout} has been successfully called.
 * @remarks To be used ONLY in a place where hooks are not available (i.e. in loaders).
 */
export async function logout(options?: { logoutParams?: { returnTo?: string } }) {
  if (!_logout) {
    console.warn("logout called before registerLogout");
    return;
  }
  return _logout(options);
}

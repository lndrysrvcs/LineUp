[**lineup-client**](../../../../README.md)

---

[lineup-client](../../../../modules.md) / [utils/api/auth-token](../README.md) / logout

# Function: logout()

> **logout**(`options?`): `Promise`\<`void`\>

Defined in: [utils/api/auth-token.ts:46](https://github.com/rhyderswen/CSDS393/blob/ecc0a38fd3f95300fa1c37b43b7273c0049bb5bd/lineup-client/src/utils/api/auth-token.ts#L46)

Logs the user out once [registerLogout](registerLogout.md) has been successfully called.

## Parameters

### options?

#### logoutParams?

\{ `returnTo?`: `string`; \}

#### logoutParams.returnTo?

`string`

## Returns

`Promise`\<`void`\>

## Remarks

To be used ONLY in a place where hooks are not available (i.e. in loaders).

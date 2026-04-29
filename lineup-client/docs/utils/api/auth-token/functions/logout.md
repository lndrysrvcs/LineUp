[**lineup-client**](../../../../index.md)

---

[lineup-client](../../../../modules.md) / [utils/api/auth-token](../index.md) / logout

# Function: logout()

> **logout**(`options?`): `Promise`\<`void`\>

Defined in: [utils/api/auth-token.ts:46](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/utils/api/auth-token.ts#L46)

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

[**lineup-client**](../../../../README.md)

---

[lineup-client](../../../../modules.md) / [utils/api/auth-token](../README.md) / getToken

# Function: getToken()

> **getToken**(): `Promise`\<`string` \| `null`\>

Defined in: [utils/api/auth-token.ts:24](https://github.com/rhyderswen/CSDS393/blob/ecc0a38fd3f95300fa1c37b43b7273c0049bb5bd/lineup-client/src/utils/api/auth-token.ts#L24)

Returns a token once [registerGetToken](registerGetToken.md) has been successfully called.

## Returns

`Promise`\<`string` \| `null`\>

A user's JWT token.

## Remarks

To be used ONLY in a place where hooks are not available (i.e. in loaders).

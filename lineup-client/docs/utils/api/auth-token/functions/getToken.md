[**lineup-client**](../../../../index.md)

---

[lineup-client](../../../../modules.md) / [utils/api/auth-token](../index.md) / getToken

# Function: getToken()

> **getToken**(): `Promise`\<`string` \| `null`\>

Defined in: [utils/api/auth-token.ts:24](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/utils/api/auth-token.ts#L24)

Returns a token once [registerGetToken](registerGetToken.md) has been successfully called.

## Returns

`Promise`\<`string` \| `null`\>

A user's JWT token.

## Remarks

To be used ONLY in a place where hooks are not available (i.e. in loaders).

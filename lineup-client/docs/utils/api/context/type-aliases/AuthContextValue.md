[**lineup-client**](../../../../index.md)

---

[lineup-client](../../../../modules.md) / [utils/api/context](../index.md) / AuthContextValue

# Type Alias: AuthContextValue

> **AuthContextValue** = `object`

Defined in: [utils/api/context.ts:5](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/utils/api/context.ts#L5)

The functions to be available to all children of an [AuthProvider](../../provider/variables/AuthProvider.md).

## Properties

### fetchWithAuth

> **fetchWithAuth**: (`path`, `init?`) => `Promise`\<`Response`\>

Defined in: [utils/api/context.ts:6](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/utils/api/context.ts#L6)

#### Parameters

##### path

`string`

##### init?

`RequestInit`

#### Returns

`Promise`\<`Response`\>

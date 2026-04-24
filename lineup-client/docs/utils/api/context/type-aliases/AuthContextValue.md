[**lineup-client**](../../../../README.md)

---

[lineup-client](../../../../modules.md) / [utils/api/context](../README.md) / AuthContextValue

# Type Alias: AuthContextValue

> **AuthContextValue** = `object`

Defined in: [utils/api/context.ts:5](https://github.com/rhyderswen/CSDS393/blob/ecc0a38fd3f95300fa1c37b43b7273c0049bb5bd/lineup-client/src/utils/api/context.ts#L5)

The functions to be available to all children of an [AuthProvider](../../provider/variables/AuthProvider.md).

## Properties

### fetchWithAuth

> **fetchWithAuth**: (`path`, `init?`) => `Promise`\<`Response`\>

Defined in: [utils/api/context.ts:6](https://github.com/rhyderswen/CSDS393/blob/ecc0a38fd3f95300fa1c37b43b7273c0049bb5bd/lineup-client/src/utils/api/context.ts#L6)

#### Parameters

##### path

`string`

##### init?

`RequestInit`

#### Returns

`Promise`\<`Response`\>

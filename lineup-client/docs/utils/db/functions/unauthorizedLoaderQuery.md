[**lineup-client**](../../../index.md)

---

[lineup-client](../../../modules.md) / [utils/db](../index.md) / unauthorizedLoaderQuery

# Function: unauthorizedLoaderQuery()

> **unauthorizedLoaderQuery**(`url`, `param`): `object`

Defined in: [utils/db.tsx:28](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/utils/db.tsx#L28)

A [React Router Loader](https://reactrouter.com/start/framework/data-loading) function for checking if a dynamic route exists and getting that page's associated data. Used for pages that users don't need to log in for (Availability and EditAvailability pages).

## Parameters

### url

`string`

The API URL to fetch from. Replaces {} with param.

### param

`string`

The specific param of the page a user navigated to.

## Returns

`object`

The data returned from the API.

### queryFn

> **queryFn**: () => `Promise`\<`any`\>

#### Returns

`Promise`\<`any`\>

### queryKey

> **queryKey**: `string`[]

## Remarks

To be used in conjunction with [useQuery (TanStack)](https://tanstack.com/query/v4/docs/framework/react/reference/useQuery).

## Example

```ts
// Queries "/api/schedule/12345/details"
useQuery(unauthorizedLoaderQuery("/api/schedule/{}/details", "12345"));
```

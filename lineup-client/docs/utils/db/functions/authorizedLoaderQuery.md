[**lineup-client**](../../../README.md)

---

[lineup-client](../../../modules.md) / [utils/db](../README.md) / authorizedLoaderQuery

# Function: authorizedLoaderQuery()

> **authorizedLoaderQuery**(`url`, `param`): `object`

Defined in: [utils/db.tsx:75](https://github.com/rhyderswen/CSDS393/blob/ecc0a38fd3f95300fa1c37b43b7273c0049bb5bd/lineup-client/src/utils/db.tsx#L75)

A [React Router Loader](https://reactrouter.com/start/framework/data-loading) function for checking if a dynamic route exists and getting that page's associated data. Used for restrcted pages that require a user to be logged in (ViewEditSchedule).

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
useQuery(authorizedLoaderQuery("/api/schedule/{}/details", "12345"));
```

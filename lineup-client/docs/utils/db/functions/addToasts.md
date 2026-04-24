[**lineup-client**](../../../README.md)

---

[lineup-client](../../../modules.md) / [utils/db](../README.md) / addToasts

# Function: addToasts()

> **addToasts**(`promise`, `loadingMessage?`, `successMessage?`): `void`

Defined in: [utils/db.tsx:12](https://github.com/rhyderswen/CSDS393/blob/ecc0a38fd3f95300fa1c37b43b7273c0049bb5bd/lineup-client/src/utils/db.tsx#L12)

Adds toasts to asynchronous functions to give user's updates on their API queries.

## Parameters

### promise

`Promise`\<`any`\>

The Promise that updates the toast once resolved.

### loadingMessage?

`string`

The message to display while the Promise is still pending. Defaults to `"Submitting..."`

### successMessage?

`string`

The message to display if the Promise completes without error. Defaults to `"Success!"`

## Returns

`void`

## Example

```ts
addToasts(mutationVar.mutateAsync(), "Working on it...", "Done!");
```

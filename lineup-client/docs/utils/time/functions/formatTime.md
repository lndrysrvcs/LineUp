[**lineup-client**](../../../README.md)

---

[lineup-client](../../../modules.md) / [utils/time](../README.md) / formatTime

# Function: formatTime()

> **formatTime**(`time`): `string`

Defined in: [utils/time.ts:27](https://github.com/rhyderswen/CSDS393/blob/ecc0a38fd3f95300fa1c37b43b7273c0049bb5bd/lineup-client/src/utils/time.ts#L27)

Formats a [Time](../../../types/type-aliases/Time.md) object into 12H format with AM/PM.

## Parameters

### time

[`Time`](../../../types/type-aliases/Time.md)

## Returns

`string`

The formatted time string.

## Example

```ts
formatTime({ hour: 9, minute: 15 });
// Returns "09:15 AM"
```

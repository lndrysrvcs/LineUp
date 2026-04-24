[**lineup-client**](../../../README.md)

---

[lineup-client](../../../modules.md) / [utils/time](../README.md) / parseTimeString

# Function: parseTimeString()

> **parseTimeString**(`time`): [`Time`](../../../types/type-aliases/Time.md) \| `null`

Defined in: [utils/time.ts:78](https://github.com/rhyderswen/CSDS393/blob/ecc0a38fd3f95300fa1c37b43b7273c0049bb5bd/lineup-client/src/utils/time.ts#L78)

Takes a time string in 24H format (e.g. `"23:59"`) and converts it to a [Time](../../../types/type-aliases/Time.md) object.

## Parameters

### time

`string`

## Returns

[`Time`](../../../types/type-aliases/Time.md) \| `null`

The converted Time object or `null` if the string is invalid.

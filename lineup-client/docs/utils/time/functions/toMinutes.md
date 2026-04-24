[**lineup-client**](../../../README.md)

---

[lineup-client](../../../modules.md) / [utils/time](../README.md) / toMinutes

# Function: toMinutes()

> **toMinutes**(`time`, `isEnd?`): `number`

Defined in: [utils/time.ts:125](https://github.com/rhyderswen/CSDS393/blob/ecc0a38fd3f95300fa1c37b43b7273c0049bb5bd/lineup-client/src/utils/time.ts#L125)

Converts a time to just how many minutes that time is past midnight.

## Parameters

### time

[`Time`](../../../types/type-aliases/Time.md)

### isEnd?

`boolean` = `false`

If the time is the end of the range.

## Returns

`number`

The number of minutes past midnight or 1440 if the time represents 24 hours.

## Remarks

Used in validating start and end times on submission.

## Example

```ts
toMinutes({ hour: 1, minute: 30 });
// returns 90
```

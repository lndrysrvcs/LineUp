[**lineup-client**](../../../README.md)

---

[lineup-client](../../../modules.md) / [utils/time](../README.md) / standardizeDateAndTime

# Function: standardizeDateAndTime()

> **standardizeDateAndTime**(`date`, `time`): `string`

Defined in: [utils/time.ts:157](https://github.com/rhyderswen/CSDS393/blob/ecc0a38fd3f95300fa1c37b43b7273c0049bb5bd/lineup-client/src/utils/time.ts#L157)

Takes a Date and Time and converts it to a standardized ISO string in UTC.

## Parameters

### date

`Date`

### time

[`Time`](../../../types/type-aliases/Time.md)

## Returns

`string`

The ISO string, formatted "YYYY-MM-DDTHH:MM".

## Remarks

Calls [addTimeToDate](addTimeToDate.md), which sets the Date's time to the Time object.

[**lineup-client**](../../../index.md)

---

[lineup-client](../../../modules.md) / [utils/time](../index.md) / getTimeIncrementLabel

# Function: getTimeIncrementLabel()

> **getTimeIncrementLabel**(`row`, `rangeStart`, `minutesPerCell`): `string`

Defined in: [utils/time.ts:51](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/utils/time.ts#L51)

Generates the label to be shown on a given row of the calendar, based on the row, starting time, and minutes per cell.

## Parameters

### row

`number`

The row the cell is in.

### rangeStart

[`Time`](../../../types/type-aliases/Time.md)

The start time of the cell in the first row.

### minutesPerCell

[`ValidMinutes`](../../../types/type-aliases/ValidMinutes.md)

How long each cell is.

## Returns

`string`

The label (formatted with [formatTime](formatTime.md)) to be shown for a row. Returns an empty string if the row should not contain a label.

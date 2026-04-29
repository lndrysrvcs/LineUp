[**lineup-client**](../../../index.md)

---

[lineup-client](../../../modules.md) / [components/Calendar](../index.md) / CalendarProps

# Interface: CalendarProps

Defined in: [components/Calendar.tsx:18](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Calendar.tsx#L18)

Props for the [Calendar](../functions/Calendar.md) component.

## Properties

### Cell

> **Cell**: `ComponentType`\<[`CalendarCellProps`](../../CalendarCells/interfaces/CalendarCellProps.md)\>

Defined in: [components/Calendar.tsx:20](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Calendar.tsx#L20)

The Cell that chooses behavior, rendered in each row/column.

---

### colors?

> `optional` **colors?**: `object`

Defined in: [components/Calendar.tsx:34](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Calendar.tsx#L34)

Map of UTC timestamps to CSS colors.

#### Index Signature

\[`key`: `string`\]: `string`

#### Example

```ts
{"2026-03-10T16:15:00.000Z": "var(--color)", ...}
```

---

### dates

> **dates**: `Date`[]

Defined in: [components/Calendar.tsx:26](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Calendar.tsx#L26)

Array of dates (columns) for the calendar. Time input does not matter.

---

### minutesPerCell

> **minutesPerCell**: [`ValidMinutes`](../../../types/type-aliases/ValidMinutes.md)

Defined in: [components/Calendar.tsx:23](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Calendar.tsx#L23)

Number of minutes each cell represents.

---

### range

> **range**: [`TimeRange`](../../../types/type-aliases/TimeRange.md)

Defined in: [components/Calendar.tsx:29](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Calendar.tsx#L29)

Start time of first cell to end time of last cell.

---

### selectedCells?

> `optional` **selectedCells?**: `string`[]

Defined in: [components/Calendar.tsx:45](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Calendar.tsx#L45)

Array of UTC timestamps for which cells are shown as selected.

---

### setFocusedCell?

> `optional` **setFocusedCell?**: `Dispatch`\<`SetStateAction`\<`string` \| `null`\>\>

Defined in: [components/Calendar.tsx:42](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Calendar.tsx#L42)

React state setter to update which cell a user is currently focusing over. Sets `null` when not hovering over a cell.

---

### setSelectedCells?

> `optional` **setSelectedCells?**: `Dispatch`\<`SetStateAction`\<`string`[]\>\>

Defined in: [components/Calendar.tsx:48](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Calendar.tsx#L48)

React state setter for [selectedCells](#selectedcells).

---

### text?

> `optional` **text?**: `object`

Defined in: [components/Calendar.tsx:39](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Calendar.tsx#L39)

Map of UTC timestamps to text displayed on the cell.

#### Index Signature

\[`key`: `string`\]: `string`

#### Example

```ts
{"2026-03-10T16:15:00.000Z": "Rhyder", ...}
```

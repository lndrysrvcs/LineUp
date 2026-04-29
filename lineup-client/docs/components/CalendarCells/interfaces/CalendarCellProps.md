[**lineup-client**](../../../index.md)

---

[lineup-client](../../../modules.md) / [components/CalendarCells](../index.md) / CalendarCellProps

# Interface: CalendarCellProps

Defined in: [components/CalendarCells.tsx:8](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/CalendarCells.tsx#L8)

Props for the [ColoredCell](../functions/ColoredCell.md) and [FillableCell](../functions/FillableCell.md) components.

## Properties

### colors

> **colors**: `object`

Defined in: [components/CalendarCells.tsx:34](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/CalendarCells.tsx#L34)

Map of UTC timestamps to CSS colors.

#### Index Signature

\[`key`: `string`\]: `string`

---

### date

> **date**: `Date`

Defined in: [components/CalendarCells.tsx:13](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/CalendarCells.tsx#L13)

The day of the month (column).

---

### isEnablingCells

> **isEnablingCells**: `boolean`

Defined in: [components/CalendarCells.tsx:28](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/CalendarCells.tsx#L28)

If the user is enabling or disabling cells.

---

### isPointerDown

> **isPointerDown**: `boolean`

Defined in: [components/CalendarCells.tsx:22](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/CalendarCells.tsx#L22)

If the user is holding mouse click/tap.

---

### selectedCells?

> `optional` **selectedCells?**: `string`[]

Defined in: [components/CalendarCells.tsx:16](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/CalendarCells.tsx#L16)

Array of UTC timestamps for which cells are shown as selected.

---

### setIsEnablingCells

> **setIsEnablingCells**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>

Defined in: [components/CalendarCells.tsx:31](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/CalendarCells.tsx#L31)

React state setter for [isEnablingCells](#isenablingcells).

---

### setIsPointerDown

> **setIsPointerDown**: `Dispatch`\<`SetStateAction`\<`boolean`\>\>

Defined in: [components/CalendarCells.tsx:25](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/CalendarCells.tsx#L25)

React state setter to update if the user is holding mouse click/tap.

---

### setSelectedCells?

> `optional` **setSelectedCells?**: `Dispatch`\<`SetStateAction`\<`string`[]\>\>

Defined in: [components/CalendarCells.tsx:19](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/CalendarCells.tsx#L19)

React state setter for [selectedCells](#selectedcells).

---

### text

> **text**: `object`

Defined in: [components/CalendarCells.tsx:37](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/CalendarCells.tsx#L37)

Map of UTC timestamps to text displayed on the cell.

#### Index Signature

\[`key`: `string`\]: `string`

---

### time

> **time**: [`Time`](../../../types/type-aliases/Time.md)

Defined in: [components/CalendarCells.tsx:10](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/CalendarCells.tsx#L10)

The start time (row).

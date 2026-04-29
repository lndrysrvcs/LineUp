[**lineup-client**](../../../index.md)

---

[lineup-client](../../../modules.md) / [components/Table](../index.md) / TableProps

# Interface: TableProps\<T\>

Defined in: [components/Table.tsx:7](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Table.tsx#L7)

Props for the [Table](../functions/default.md) component.

## Type Parameters

### T

`T`

The type of the data for a single row.

## Properties

### columnWidths?

> `optional` **columnWidths?**: `string`[]

Defined in: [components/Table.tsx:22](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Table.tsx#L22)

A list of CSS width values.

#### Example

```ts
["10%", "20px", "5rem", ...]
```

#### Default Value

```ts
Equal widths
```

---

### data

> **data**: `T`[]

Defined in: [components/Table.tsx:12](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Table.tsx#L12)

The data to be rendered inside each row.

---

### headers

> **headers**: `string`[]

Defined in: [components/Table.tsx:9](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Table.tsx#L9)

The name to display at the top of each column.

---

### renderRow

> **renderRow**: (`item`) => `ReactNode`

Defined in: [components/Table.tsx:15](https://github.com/rhyderswen/LineUp/blob/b2755005f655d50dd5f2fef681fc2f663505ff02/lineup-client/src/components/Table.tsx#L15)

The function to render a single row. Will be called for each row.

#### Parameters

##### item

`T`

#### Returns

`ReactNode`

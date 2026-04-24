import "./table.css";

/**
 * Props for the {@link Table} component.
 * @typeParam T - The type of the data for a single row.
 */
export interface TableProps<T> {
  /** The name to display at the top of each column. */
  headers: string[];

  /** The data to be rendered inside each row. */
  data: T[];

  /** The function to render a single row. Will be called for each row. */
  renderRow: (item: T) => React.ReactNode;

  /** A list of CSS width values.
   *
   * @example ["10%", "20px", "5rem", ...]
   * @defaultValue Equal widths
   */
  columnWidths?: string[];
}

/**
 * A customizable table that renders row data into a common format.
 *
 * @param props - The component props.
 * @typeParam T - The type of the data for a single row.
 */
const Table = <T,>({ headers, data, renderRow, columnWidths }: TableProps<T>) => {
  return (
    <table className="scheduleTable">
      <colgroup>
        {
          // Sets the width of each column or defaults to equal widths
        }
        {columnWidths?.map((width, index) => (
          <col key={index} style={{ width }} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {
            // Renders the table header row
          }
          {headers.map((header) => (
            <th key={header}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {
          // Renders each data row based on the given renderRow function
        }
        {data.map((item, index) => (
          <tr key={index}>{renderRow(item)}</tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;

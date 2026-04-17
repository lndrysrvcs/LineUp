import "./table.css";

interface TableProps<T> {
  headers: string[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
  columnWidths?: string[];
}

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

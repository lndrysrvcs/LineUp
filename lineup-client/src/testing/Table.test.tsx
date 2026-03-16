/**
 * @vitest-environment jsdom
 */
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Table from "../components/Table";

interface TestData {
  name: string;
  respondents: number;
  link: string;
}

describe("Table component", () => {
  const headers = ["Schedule", "Respondents"];
  const data: TestData[] = [
    { name: "Event 1", respondents: 17, link: "https://event1" },
    { name: "Event 2", respondents: 31, link: "https://event2" },
  ];

  const renderRow = (item: TestData) => (
    <>
      <td>{item.name}</td>
      <td>{item.respondents}</td>
      <td>{item.link}</td>
    </>
  );

  it("renders the table headers", () => {
    render(<Table headers={headers} data={[]} renderRow={renderRow} />);
    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  it("renders the table rows based on data", () => {
    render(<Table headers={headers} data={data} renderRow={renderRow} />);
    data.forEach((item) => {
      expect(screen.getByText(item.name)).toBeInTheDocument();
      expect(screen.getByText(item.respondents.toString())).toBeInTheDocument();
      expect(screen.getByText(item.link)).toBeInTheDocument();
    });
  });

  it("applies column widths when provided", () => {
    const columnWidths = ["200px", "100px", "300px"];
    const { container } = render(
      <Table headers={headers} data={data} renderRow={renderRow} columnWidths={columnWidths} />,
    );
    const cols = container.querySelectorAll("col");
    expect(cols.length).toBe(columnWidths.length);
    cols.forEach((col, index) => {
      expect(col).toHaveStyle(`width: ${columnWidths[index]}`);
    });
  });

  it("renders custom row content", () => {
    const customRenderRow = (item: TestData) => (
      <>
        <td>{item.name.toUpperCase()}</td>
        <td>{item.respondents + 1}</td>
        <td>{item.link.toUpperCase()}</td>
      </>
    );

    render(<Table headers={headers} data={data} renderRow={customRenderRow} />);
    expect(screen.getByText("EVENT 1")).toBeInTheDocument();
    expect(screen.getByText("18")).toBeInTheDocument();
    expect(screen.getByText("HTTPS://EVENT1")).toBeInTheDocument();
    expect(screen.getByText("EVENT 2")).toBeInTheDocument();
    expect(screen.getByText("32")).toBeInTheDocument();
    expect(screen.getByText("HTTPS://EVENT2")).toBeInTheDocument();
  });
});

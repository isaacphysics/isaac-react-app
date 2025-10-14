import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Accordion from "../../app/components/pages/IsaacCompetition/Accordion/Accordion";

describe("Accordion Component", () => {
  const sections = [
    {
      id: "1",
      title: "Section 1",
      section: ["Item 1", ["Sub-item 1", "Sub-item 2"]],
    },
    {
      id: "2",
      title: "Section 2",
      section: ["Item 3", "Item 3"],
    },
  ];
  const setOpenState = jest.fn();

  it("renders Accordion component", () => {
    render(<Accordion sections={sections} open={null} setOpenState={setOpenState} />);
    expect(screen.getByText("Section 1")).toBeInTheDocument();
    expect(screen.getByText("Section 2")).toBeInTheDocument();
  });

  it("renders correct number of AccordionItem components", () => {
    render(<Accordion sections={sections} open={null} setOpenState={setOpenState} />);
    const items = screen.getAllByTestId("accordion-item");
    expect(items.length).toBe(sections.length);
  });

  it("calls setOpenState with correct argument when AccordionItem is clicked", () => {
    render(<Accordion sections={sections} open={null} setOpenState={setOpenState} />);
    const firstItem = screen.getAllByText("Section 1")[0];
    fireEvent.click(firstItem);
    expect(setOpenState).toHaveBeenCalledWith("1");
  });

  it("renders the section content correctly when open", () => {
    render(<Accordion sections={sections} open="1" setOpenState={setOpenState} />);
    expect(screen.getAllByText("Item 1")[0]).toBeInTheDocument();
    expect(screen.getByText("Sub-item 1")).toBeInTheDocument();
    expect(screen.getByText("Sub-item 2")).toBeInTheDocument();
  });

  it("renders the section content as a list when it contains a sub-array", () => {
    render(<Accordion sections={sections} open="1" setOpenState={setOpenState} />);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems.length).toBe(2);
    expect(listItems[0]).toHaveTextContent("Sub-item 1");
    expect(listItems[1]).toHaveTextContent("Sub-item 2");
  });

  it("matches the snapshot when closed", () => {
    const { asFragment } = render(<Accordion sections={sections} open={null} setOpenState={setOpenState} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("renders HTML content with links correctly", () => {
    const sectionsWithLinks = [
      {
        id: "1",
        title: "Section with Links",
        section: ["Visit <a href='https://example.com'>our website</a> for more info"],
      },
    ];
    render(<Accordion sections={sectionsWithLinks} open="1" setOpenState={setOpenState} />);

    const link = screen.getByRole("link", { name: /our website/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("renders deeply nested lists correctly", () => {
    const sectionsWithNestedLists = [
      {
        id: "1",
        title: "Nested Lists",
        section: ["Main item", ["Level 1 item", ["Level 2 item", ["Level 3 item"]]]],
      },
    ];
    render(<Accordion sections={sectionsWithNestedLists} open="1" setOpenState={setOpenState} />);

    expect(screen.getByText("Main item")).toBeInTheDocument();
    expect(screen.getByText("Level 1 item")).toBeInTheDocument();
    expect(screen.getByText("Level 2 item")).toBeInTheDocument();
    expect(screen.getByText("Level 3 item")).toBeInTheDocument();

    // Check that nested lists are properly structured
    const lists = screen.getAllByRole("list");
    expect(lists.length).toBeGreaterThan(1);
  });

  it("shows correct chevron icons based on open state", () => {
    render(<Accordion sections={sections} open="1" setOpenState={setOpenState} />);

    // First section should show up chevron (open)
    const upIcon = screen.getByAltText("Up Icon");
    expect(upIcon).toBeInTheDocument();
    expect(upIcon).toHaveAttribute("src", "/assets/chevron_up.svg");

    // Second section should show down chevron (closed)
    const downIcon = screen.getByAltText("Down Icon");
    expect(downIcon).toBeInTheDocument();
    expect(downIcon).toHaveAttribute("src", "/assets/chevron_down.svg");
  });

  it("toggles accordion state correctly when clicked", () => {
    const { rerender } = render(<Accordion sections={sections} open={null} setOpenState={setOpenState} />);

    const firstItem = screen.getAllByText("Section 1")[0];

    fireEvent.click(firstItem);
    expect(setOpenState).toHaveBeenCalledWith("1");

    rerender(<Accordion sections={sections} open="1" setOpenState={setOpenState} />);

    fireEvent.click(firstItem);
    expect(setOpenState).toHaveBeenCalledWith(undefined);
  });

  it("handles empty sections gracefully", () => {
    const emptySections = [
      {
        id: "1",
        title: "Empty Section",
        section: [],
      },
    ];
    render(<Accordion sections={emptySections} open="1" setOpenState={setOpenState} />);

    expect(screen.getByText("Empty Section")).toBeInTheDocument();
    // Should not crash or throw errors
  });

  it("handles mixed content types correctly", () => {
    const mixedContentSections = [
      {
        id: "1",
        title: "Mixed Content",
        section: [
          "Plain text",
          ["List item 1", "List item 2"],
          "More plain text with <a href='#'>a link</a>",
          [["Deeply nested item"]],
        ],
      },
    ];
    render(<Accordion sections={mixedContentSections} open="1" setOpenState={setOpenState} />);

    expect(screen.getByText("Plain text")).toBeInTheDocument();
    expect(screen.getByText("List item 1")).toBeInTheDocument();
    expect(screen.getByText("More plain text with")).toBeInTheDocument();
    expect(screen.getByText("Deeply nested item")).toBeInTheDocument();
    expect(screen.getByRole("link")).toBeInTheDocument();
  });

  it("matches snapshot when open", () => {
    const { asFragment } = render(<Accordion sections={sections} open="1" setOpenState={setOpenState} />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("matches snapshot with nested content", () => {
    const nestedSections = [
      {
        id: "1",
        title: "Nested Section",
        section: ["Main content", ["Sub item 1", "Sub item 2"], "More content"],
      },
    ];
    const { asFragment } = render(<Accordion sections={nestedSections} open="1" setOpenState={setOpenState} />);
    expect(asFragment()).toMatchSnapshot();
  });
});

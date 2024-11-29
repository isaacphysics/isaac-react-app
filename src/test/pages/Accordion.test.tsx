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
});

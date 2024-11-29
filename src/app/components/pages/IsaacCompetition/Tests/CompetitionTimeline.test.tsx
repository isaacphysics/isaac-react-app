import React from "react";
import { render, screen } from "@testing-library/react";
import CompetitionTimeline from "../CompetitionInformation/CompetitionTimeline";

describe("CompetitionTimeline Component", () => {
  const mockEntries = [
    { event: "Event 1", date: "2024-01-01" },
    { event: "Event 2", date: "2024-02-01" },
    { event: "Event 3", date: "2024-03-01" },
  ];

  const title = "Competition Timeline";
  const content = "Here is the timeline of events.";

  test("renders title and content", () => {
    render(<CompetitionTimeline title={title} content={content} entries={mockEntries} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(content)).toBeInTheDocument();
  });

  test("renders correct number of entries", () => {
    render(<CompetitionTimeline title={title} content={content} entries={mockEntries} />);

    const entryElements = mockEntries.map((entry) => screen.getByText(entry.event));

    expect(entryElements.length).toBe(mockEntries.length);
  });

  test("renders entry event and date correctly", () => {
    render(<CompetitionTimeline title={title} content={content} entries={mockEntries} />);

    mockEntries.forEach((entry) => {
      expect(screen.getByText(entry.event)).toBeInTheDocument();
      expect(screen.getByText(entry.date)).toBeInTheDocument();
    });
  });

  test("renders arrows between entries except for the last one", () => {
    const { container } = render(<CompetitionTimeline title={title} content={content} entries={mockEntries} />);

    const arrows = container.querySelectorAll(".competition-timeline-arrow");
    expect(arrows.length).toBe(mockEntries.length - 1);
  });
});

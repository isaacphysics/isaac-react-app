import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CompetitionWrapper from "../CompetitionWrapper";

describe("CompetitionWrapper", () => {
  it("renders beforeCompetitionOpenContent before the competition opens", () => {
    const { getByText } = render(
      <CompetitionWrapper
        currentDate={new Date("2025-10-01T12:00:00")} // Before Nov 2, 2025
        beforeCompetitionOpenContent={<div>Opening November 2025</div>}
      >
        <div>Competition is open</div>
      </CompetitionWrapper>,
    );
    expect(getByText("Opening November 2025")).toBeInTheDocument();
  });

  it("renders children during the competition period", () => {
    const { getByText, queryByText } = render(
      <CompetitionWrapper currentDate={new Date("2025-12-01T12:00:00")}>
        {" "}
        {/* Between Nov 2, 2025 and Jan 31, 2026 */}
        <div>Competition is open</div>
      </CompetitionWrapper>,
    );
    expect(getByText("Competition is open")).toBeInTheDocument();
    expect(queryByText("Opening November 2025")).not.toBeInTheDocument();
  });

  it("renders closedCompetitionContent after competition ends but before banner end date", () => {
    const { getByText } = render(
      <CompetitionWrapper
        currentDate={new Date("2026-02-15T12:00:00")} // Between Jan 31, 2026 and Mar 13, 2026
        closedCompetitionContent={<div>Entries for this competition have now closed</div>}
      >
        <div>Competition is open</div>
      </CompetitionWrapper>,
    );
    expect(getByText("Entries for this competition have now closed")).toBeInTheDocument();
  });

  it("renders nothing after the banner end date", () => {
    const { queryByText } = render(
      <CompetitionWrapper
        currentDate={new Date("2026-04-01T12:00:00")} // After Mar 13, 2026
        beforeCompetitionOpenContent={<div>Opening November 2025</div>}
        closedCompetitionContent={<div>Entries for this competition have now closed</div>}
      >
        <div>Competition is open</div>
      </CompetitionWrapper>,
    );
    expect(queryByText("Competition is open")).not.toBeInTheDocument();
    expect(queryByText("Opening November 2025")).not.toBeInTheDocument();
    expect(queryByText("Entries for this competition have now closed")).not.toBeInTheDocument();
  });
});

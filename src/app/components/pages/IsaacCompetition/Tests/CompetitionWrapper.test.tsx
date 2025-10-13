import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CompetitionWrapper from "../CompetitionWrapper";
import { COMPETITION_OPEN_DATE, COMPETITION_END_DATE, ENTRIES_CLOSED_BANNER_END_DATE } from "../dateUtils";

describe("CompetitionWrapper", () => {
  it("renders beforeCompetitionOpenContent before the competition opens", () => {
    // Use a date before COMPETITION_OPEN_DATE
    const dateBeforeOpen = new Date(COMPETITION_OPEN_DATE.getTime() - 24 * 60 * 60 * 1000); // 1 day before

    const { getByText } = render(
      <CompetitionWrapper currentDate={dateBeforeOpen} beforeCompetitionOpenContent={<div>Opening November 2025</div>}>
        <div>Competition is open</div>
      </CompetitionWrapper>,
    );
    expect(getByText("Opening November 2025")).toBeInTheDocument();
  });

  it("renders children during the competition period", () => {
    // Use a date between COMPETITION_OPEN_DATE and COMPETITION_END_DATE
    const dateDuringCompetition = new Date(COMPETITION_OPEN_DATE.getTime() + 24 * 60 * 60 * 1000); // 1 day after open

    const { getByText, queryByText } = render(
      <CompetitionWrapper currentDate={dateDuringCompetition}>
        <div>Competition is open</div>
      </CompetitionWrapper>,
    );
    expect(getByText("Competition is open")).toBeInTheDocument();
    expect(queryByText("Opening November 2025")).not.toBeInTheDocument();
  });

  it("renders closedCompetitionContent after competition ends but before banner end date", () => {
    // Use a date between COMPETITION_END_DATE and ENTRIES_CLOSED_BANNER_END_DATE
    const dateAfterEnd = new Date(COMPETITION_END_DATE.getTime() + 24 * 60 * 60 * 1000); // 1 day after end

    const { getByText } = render(
      <CompetitionWrapper
        currentDate={dateAfterEnd}
        closedCompetitionContent={<div>Entries for this competition have now closed</div>}
      >
        <div>Competition is open</div>
      </CompetitionWrapper>,
    );
    expect(getByText("Entries for this competition have now closed")).toBeInTheDocument();
  });

  it("renders nothing after the banner end date", () => {
    // Use a date after ENTRIES_CLOSED_BANNER_END_DATE
    const dateAfterBannerEnd = new Date(ENTRIES_CLOSED_BANNER_END_DATE.getTime() + 24 * 60 * 60 * 1000); // 1 day after

    const { queryByText } = render(
      <CompetitionWrapper
        currentDate={dateAfterBannerEnd}
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

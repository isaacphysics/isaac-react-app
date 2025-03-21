import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import CompetitionWrapper from "../CompetitionWrapper";

describe("CompetitionWrapper", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("renders children before the end date", () => {
    jest.setSystemTime(new Date("2025-03-28T15:00:00")); // 1 hour before the end date
    const { getByText } = render(
      <CompetitionWrapper>
        <div>Competition is open</div>
      </CompetitionWrapper>,
    );
    expect(getByText("Competition is open")).toBeInTheDocument();
  });

  it("renders afterEndDateChildren within 4 weeks after the end date", () => {
    jest.setSystemTime(new Date("2025-04-15T12:00:00")); // Within 4 weeks after the end date
    const { getByText } = render(
      <CompetitionWrapper closedCompetitionContent={<div>Entries for this competition have now closed</div>}>
        <div>Competition is open</div>
      </CompetitionWrapper>,
    );
    expect(getByText("Entries for this competition have now closed")).toBeInTheDocument();
  });

  it("renders nothing after 4 weeks from the end date", () => {
    jest.setSystemTime(new Date("2025-05-01T12:00:00")); // After 4 weeks from the end date
    const { queryByText } = render(
      <CompetitionWrapper closedCompetitionContent={<div>Entries for this competition have now closed</div>}>
        <div>Competition is open</div>
      </CompetitionWrapper>,
    );
    expect(queryByText("Competition is open")).not.toBeInTheDocument();
    expect(queryByText("Entries for this competition have now closed")).not.toBeInTheDocument();
  });
});

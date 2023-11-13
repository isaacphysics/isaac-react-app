import { GenderDetails } from "../../../../../app/components/elements/panels/SelectedEventDetails";
import { mockEventBookings } from "../../../../../mocks/data";
import { renderTestEnvironment } from "../../../../utils";
import { screen } from "@testing-library/react";

describe("GenderDetails", () => {
  const setupTest = (props = {}) => {
    renderTestEnvironment({
      PageComponent: GenderDetails,
      componentProps: {
        ...props,
      },
      initialRouteEntries: ["/admin/events/"],
    });
  };
  const genders = ["Male", "Female", "Other", "Prefer not to say", "Unknown"];

  it("renders a list of 0 count genders when there are no event bookings", () => {
    setupTest({ eventBookings: [] });
    const eventGenders = screen.getByTestId("event-genders");
    expect(eventGenders).toHaveTextContent("Gender:");
    const genderStats = screen.getByRole("list");
    genders.forEach((value) => {
      expect(genderStats).toHaveTextContent(`${value}: 0 (0%)`);
    });
  });

  it("renders a list of genders with correct counts when there are event bookings", () => {
    setupTest({ eventBookings: mockEventBookings });
    const genderStats = screen.getByRole("list");
    genders.forEach((value) => {
      expect(genderStats).toHaveTextContent(`${value}: 1 (20%)`);
    });
  });
});

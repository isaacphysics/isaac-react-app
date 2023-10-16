import { LocationDetails } from "../../../../../app/components/elements/panels/SelectedEventDetails";
import { renderTestEnvironment } from "../../../../utils";
import { screen } from "@testing-library/react";

describe("LocationDetails", () => {
  const setupTest = (props = {}) => {
    renderTestEnvironment({
      PageComponent: LocationDetails,
      componentProps: {
        location: {
          address: {
            addressLine1: "123 Main St",
            town: "Anytown",
            postalCode: "12345",
          },
        },
        ...props,
      },
      initialRouteEntries: ["/admin/events/"],
    });
  };

  it("renders the location address when not virtual", () => {
    setupTest({ isVirtual: false });
    const address = screen.getByText("123 Main St, Anytown, 12345");
    const online = screen.queryByText("Online");
    expect(online).toBeNull();
    expect(address).toBeInTheDocument();
  });

  it("renders 'Online' when virtual", () => {
    setupTest({ isVirtual: true });
    const address = screen.queryByText("123 Main St, Anytown, 12345");
    const online = screen.getByText("Online");
    expect(online).toBeInTheDocument();
    expect(address).toBeNull();
  });
});

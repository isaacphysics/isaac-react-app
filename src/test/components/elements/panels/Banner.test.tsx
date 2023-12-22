import React, { PropsWithChildren } from "react";
import { Banner, BannerProps } from "../../../../app/components/elements/panels/Banner";
import { getById, renderTestEnvironment } from "../../../utils";
import { screen, within } from "@testing-library/react";

const testBannerDescription = <div>This is a test description.</div>;

const mockBannerProps: PropsWithChildren<BannerProps> = {
  id: "test-banner",
  title: "Test Banner",
  subtitle: "Here is a test subtitle",
  link: "https://examplelink.com",
  color: "primary",
  imageSource: "testimage.png",
  imageDescription: "description of image",
  children: testBannerDescription,
};

describe("Banner", () => {
  const setupTest = (props = {}) => {
    renderTestEnvironment({
      PageComponent: Banner,
      componentProps: {
        ...props,
      },
      initialRouteEntries: ["/events/"],
    });
  };

  it("renders title, subtitle, image, link and description with expected attributes", () => {
    setupTest(mockBannerProps);
    const banner = getById(mockBannerProps.id);
    const title = screen.getByRole("button", { name: mockBannerProps.title });
    const subtitle = screen.getByText(mockBannerProps.subtitle);
    const image = within(banner).getByRole("img");
    const link = screen.getByRole("link", { name: mockBannerProps.subtitle });
    const description = screen.getByTestId("banner-description");
    [banner, title, subtitle, link, description, image].forEach((element) => {
      expect(element).toBeInTheDocument();
    });
    expect(image).toHaveAttribute("src", mockBannerProps.imageSource);
    expect(image).toHaveAttribute("alt", mockBannerProps.imageDescription);
    expect(description).toHaveTextContent(/test description/i);
    expect(link).toHaveAttribute("href", mockBannerProps.link);
    expect(banner).toHaveClass("banner-primary");
  });

  it("uses a default alt text if none is provided", () => {
    setupTest({ ...mockBannerProps, imageDescription: undefined });
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("alt", "banner image");
  });

  it("changes the classname if color prop is changed to secondary", () => {
    setupTest({ ...mockBannerProps, color: "secondary" });
    const banner = getById(mockBannerProps.id);
    expect(banner).toHaveClass("banner-secondary");
  });
});

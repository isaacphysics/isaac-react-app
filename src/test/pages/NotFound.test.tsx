import { screen } from "@testing-library/react";
import { renderTestEnvironment } from "../utils";
import { NotFound } from "../../app/components/pages/NotFound";

describe("NotFound page", () => {
  it("links to contact form using pageNotFound preset and page id", () => {
    renderTestEnvironment({
      PageComponent: NotFound,
      initialRouteEntries: ["/missing-page"],
    });

    const contactLink = screen.getByRole("link", { name: /contact us/i });
    expect(contactLink).toHaveAttribute(
      "href",
      expect.stringContaining("/contact?preset=pageNotFound&page=%2Fmissing-page&url="),
    );
  });
});

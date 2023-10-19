import { formatPageTitle } from "../../../app/components/elements/PageTitle";
import { formatBreadcrumbItemTitle } from "../../../app/components/elements/TitleAndBreadcrumb";
import { Markup } from "../../../app/components/elements/markup";

describe("Parameter to disallow LaTeX rendering is observed by PageTitle", () => {
  it("Uses a LaTeX component for title by default", () => {
    // Act
    const pageTitleElement = formatPageTitle("\\(x^2 + y^2 = z^2\\)");

    // Assert
    expect(pageTitleElement.type).toBe(Markup);
    expect(pageTitleElement.props.encoding).toBe("latex");
  });
  it("Uses plaintext (span) element for title when LaTeX is disallowed", () => {
    // Act
    const pageTitleElement = formatPageTitle("\\(x^2 + y^2 = z^2\\)", true);

    // Assert
    expect(pageTitleElement.type).toBe(Markup);
    expect(pageTitleElement.props.encoding).toBe("plaintext");
  });
});
describe("Parameter to disallow LaTeX rendering is observed by Breadcrumbs", () => {
  it("Uses a LaTeX component for breadcrumb title by default", () => {
    // Act
    const breadcrumbTitleElement = formatBreadcrumbItemTitle("\\(x^2 + y^2 = z^2\\)");

    // Assert
    expect(breadcrumbTitleElement.type).toBe(Markup);
    expect(breadcrumbTitleElement.props.encoding).toBe("latex");
  });
  it("Uses plaintext (span) element for breadcrumb title when LaTeX is disallowed", () => {
    // Act
    const breadcrumbTitleElement = formatBreadcrumbItemTitle("\\(x^2 + y^2 = z^2\\)", true);

    // Assert
    expect(breadcrumbTitleElement.type).toBe(Markup);
    expect(breadcrumbTitleElement.props.encoding).toBe("plaintext");
  });
});

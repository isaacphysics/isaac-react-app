import React from "react";
import {LaTeX} from "../../../app/components/elements/LaTeX";
import {formatPageTitle} from "../../../app/components/elements/PageTitle";
import {formatBreadcrumbItemTitle} from "../../../app/components/elements/TitleAndBreadcrumb";

describe("Parameter to disallow LaTeX rendering is observed by PageTitle", () => {
    it("Uses a LaTeX component for title by default",
        () => {
            // Act
            const pageTitleElement = formatPageTitle('\\(x^2 + y^2 = z^2\\)')

            // Assert
            expect(pageTitleElement.type).toBe(LaTeX)
        }
    )
    it("Uses a plain span element for title when LaTeX is disallowed",
        () => {
            // Act
            const pageTitleElement = formatPageTitle('\\(x^2 + y^2 = z^2\\)', true)

            // Assert
            expect(pageTitleElement.type).toBe("span")
        }
    )
})
describe("Parameter to disallow LaTeX rendering is observed by Breadcrumbs", () => {
    it("Uses a LaTeX component for breadcrumb title by default",
        () => {
            // Act
            const breadcrumbTitleElement = formatBreadcrumbItemTitle('\\(x^2 + y^2 = z^2\\)')

            // Assert
            expect(breadcrumbTitleElement.type).toBe(LaTeX)
        }
    )
    it("Uses a plain span element for breadcrumb title when LaTeX is disallowed",
        () => {
            // Act
            const breadcrumbTitleElement = formatBreadcrumbItemTitle('\\(x^2 + y^2 = z^2\\)', true)

            // Assert
            expect(breadcrumbTitleElement.type).toBe("span")
        }
    )
})


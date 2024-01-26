import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportButton } from "../../../app/components/elements/ReportButton";
import { renderTestEnvironment } from "../../utils";
import * as actions from "../../../app/state/actions/logging";

const renderReportButton = (pageId?: string) => {
  renderTestEnvironment({
    role: "STUDENT",
    PageComponent: ReportButton,
    componentProps: {
      pageId: pageId,
    },
    initialRouteEntries: ["/"],
  });
};

const button = () =>
  screen.getByRole("button", {
    name: /report a problem/i,
  });

describe("ReportButton", () => {
  jest.spyOn(window, "open").mockImplementation(jest.fn());

  const logActionSpy = jest.spyOn(actions, "logAction");

  const propTestCases = [undefined, "example_id"];

  it.each(propTestCases)("renders button when page ID is %s", (pageId) => {
    renderReportButton(pageId);
    expect(button()).toBeInTheDocument();
  });

  it("opens a new window with expected URL when clicked", async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "https://example.com/" },
    });
    renderReportButton("example_id");
    await userEvent.click(button());
    expect(window.open).toHaveBeenCalledWith(
      `/contact?preset=contentProblem&url=https://example.com/&page=example_id`,
      "_blank",
    );
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it("logs an action when clicked", async () => {
    renderReportButton("example_id");
    await userEvent.click(button());
    expect(logActionSpy).toHaveBeenCalledWith({
      type: "REPORT_CONTENT_PAGE",
      pageId: "example_id",
    });
  });
});

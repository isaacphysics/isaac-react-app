import { screen } from "@testing-library/react";
import {
  ReportAccordionButton,
  ReportAccordionButtonProps,
} from "../../../app/components/elements/ReportAccordionButton";
import { renderTestEnvironment } from "../../utils";
import * as actions from "../../../app/state/actions/logging";
import userEvent from "@testing-library/user-event";

const renderReportButton = (props: ReportAccordionButtonProps) => {
  renderTestEnvironment({
    role: "STUDENT",
    PageComponent: ReportAccordionButton,
    componentProps: props,
    initialRouteEntries: ["/"],
  });
};

const button = () =>
  screen.getByRole("button", {
    name: /report a problem/i,
  });

const propTestCases = [
  { prop: "pageId", value: undefined },
  { prop: "pageId", value: "example_id" },
  { prop: "sectionId", value: undefined },
  { prop: "sectionId", value: "example_id" },
  { prop: "sectionTitle", value: undefined },
  { prop: "sectionTitle", value: "example_title" },
  { prop: "sectionIndex", value: undefined },
  { prop: "sectionIndex", value: 2 },
];

describe("ReportAccordionButton", () => {
  jest.spyOn(window, "open").mockImplementation(jest.fn());
  const logActionSpy = jest.spyOn(actions, "logAction");

  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    Object.defineProperty(window, "location", {
      writable: true,
      value: { ...originalLocation, href: "https://example.com/" },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: originalLocation,
    });
  });

  it.each(propTestCases)("renders button when $prop is $value", ({ prop, value }) => {
    renderReportButton({ [prop]: value });
    expect(button()).toBeInTheDocument();
  });

  it("opens a new window with expected URL when clicked, if pageId is provided", async () => {
    renderReportButton({ pageId: "example_id" });
    await userEvent.click(button());
    expect(window.open).toHaveBeenCalledWith(
      `/contact?preset=contentProblem&page=example_id&url=https://example.com/`,
      "_blank",
    );
  });

  it("opens a new window with expected URL and logs action when clicked, if pageId and sectionID are provided", async () => {
    renderReportButton({ pageId: "example_id", sectionTitle: "example_title" });
    await userEvent.click(button());
    expect(window.open).toHaveBeenCalledWith(
      `/contact?preset=contentProblem&page=example_id&section=example_title&url=https://example.com/`,
      "_blank",
    );
    expect(logActionSpy).toHaveBeenCalledWith({
      type: "REPORT_CONTENT_ACCORDION_SECTION",
      pageId: "example_id",
      accordionTitle: "example_title",
    });
  });

  it("opens a new window with expected URL and logs action when clicked, if sectionId is provided", async () => {
    renderReportButton({ sectionId: "example_id" });
    await userEvent.click(button());
    expect(window.open).toHaveBeenCalledWith(
      `/contact?preset=contentProblem&accordion=example_id&url=https://example.com/`,
      "_blank",
    );
    expect(logActionSpy).toHaveBeenCalledWith({
      type: "REPORT_CONTENT_ACCORDION_SECTION",
      accordionId: "example_id",
    });
  });

  it("opens a new window with expected URL and logs action when clicked, if all props are provided", async () => {
    renderReportButton({
      pageId: "example_id",
      sectionId: "example_id",
      sectionTitle: "example_title",
      sectionIndex: 2,
    });
    await userEvent.click(button());
    expect(window.open).toHaveBeenCalledWith(
      `/contact?preset=contentProblem&accordion=example_id&url=https://example.com/`,
      "_blank",
    );
    expect(logActionSpy).toHaveBeenCalledWith({
      type: "REPORT_CONTENT_ACCORDION_SECTION",
      pageId: "example_id",
      accordionId: "example_id",
      accordionTitle: "example_title",
      accordionIndex: 2,
    });
  });
});

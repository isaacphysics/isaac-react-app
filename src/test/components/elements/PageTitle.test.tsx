import React from "react";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { getById, renderTestEnvironment } from "../../utils";
import { PageTitle, PageTitleProps } from "../../../app/components/elements/PageTitle";
import { ViewingContext } from "../../../IsaacAppTypes";

const setupTest = (props: PageTitleProps = { currentPageTitle: "Test Title" }) => {
  renderTestEnvironment({
    PageComponent: PageTitle,
    componentProps: {
      ...props,
    },
    initialRouteEntries: ["/gameboard#test-gameboard"],
  });
};

describe("PageTitle", () => {
  it("renders page title and subtitle if provided", () => {
    setupTest({ currentPageTitle: "Test Title", subTitle: "Test Subtitle" });
    const pageTitle = screen.getByText(/test title/i);
    const subtitle = screen.getByText(/test subtitle/i);
    [pageTitle, subtitle].forEach((el) => expect(el).toBeInTheDocument());
  });

  it("shows help tooltip if provided", async () => {
    const pageHelp = <span>Example help text</span>;
    setupTest({ currentPageTitle: "Test Title", help: pageHelp });
    const help = getById("title-help");
    expect(help).toBeInTheDocument();
    await userEvent.hover(help);
    const helpText = screen.getByText(/example help text/i);
    expect(helpText).toBeInTheDocument();
  });

  it("shows stage and difficulty icons if provided", () => {
    const audienceViews: ViewingContext[] = [{ stage: "gcse", examBoard: "aqa", difficulty: "practice_1" }];
    setupTest({ currentPageTitle: "Test Title", audienceViews });
    const stage = screen.getByText(/gcse/i);
    const difficultyIcons = screen.getByTestId("difficulty-icons");
    const difficulty = screen.getByText(/practice \(p1\)/i);
    [stage, difficultyIcons, difficulty].forEach((el) => expect(el).toBeInTheDocument());
  });

  it("adds css classes if provided", () => {
    setupTest({ currentPageTitle: "Test Title", className: "test-class" });
    const mainHeading = screen.getByRole("heading");
    expect(mainHeading).toHaveClass("test-class");
  });

  it("offers edit button if editable", async () => {
    const onEdit = jest.fn();
    setupTest({ currentPageTitle: "Test Title", onTitleEdit: onEdit });
    const title = screen.getByText(/test title/i);
    const editButton = screen.getByRole("button", { name: /edit/i });
    [title, editButton].forEach((el) => expect(el).toBeInTheDocument());
    await userEvent.click(editButton);
    const inputField = screen.getByRole("textbox");
    const saveButton = screen.getByRole("button", { name: /save/i });
    [inputField, saveButton].forEach((el) => expect(el).toBeInTheDocument());
    await userEvent.type(inputField, "New Title");
    await userEvent.click(saveButton);
    expect(onEdit).toHaveBeenCalledWith("New Title");
  });
});

import { renderTestEnvironment } from "../../../utils";
import { EditablePageTitle } from "../../../../app/components/elements/inputs/EditablePageTitle";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockOnEdit = jest.fn();

const setupTest = () => {
  renderTestEnvironment({
    PageComponent: EditablePageTitle,
    componentProps: {
      currentPageTitle: "Test Title",
      onEdit: mockOnEdit,
    },
    initialRouteEntries: ["/gameboard#test-gameboard"],
  });
};

describe("EditablePageTitle", () => {
  it("renders current page title and edit button", () => {
    setupTest();
    const pageTitle = screen.getByText(/test title/i);
    const editButton = screen.getByRole("button", { name: /edit/i });
    [pageTitle, editButton].forEach((el) => expect(el).toBeInTheDocument());
  });

  it("does not offer input field until edit button is clicked", async () => {
    setupTest();
    const inputField = screen.queryByRole("textbox");
    expect(inputField).not.toBeInTheDocument();
    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("calls onEdit function with new title when save button is clicked", async () => {
    setupTest();
    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);
    const inputField = screen.getByRole("textbox");
    await userEvent.type(inputField, "New Title");
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);
    expect(mockOnEdit).toHaveBeenCalledWith("New Title");
  });

  it("does not call onEdit function when save button is clicked with no changes", async () => {
    setupTest();
    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it("does not call onEdit function when save button is clicked with empty title", async () => {
    setupTest();
    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);
    const inputField = screen.getByRole("textbox");
    await userEvent.clear(inputField);
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it("hides the save button and brings back the edit button after saving", async () => {
    setupTest();
    const editButton = screen.getByRole("button", { name: /edit/i });
    await userEvent.click(editButton);
    const inputField = screen.getByRole("textbox");
    await userEvent.type(inputField, "New Title");
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);
    expect(editButton).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save/i })).toBeNull();
  });
});

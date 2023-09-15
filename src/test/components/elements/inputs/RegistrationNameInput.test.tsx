import { fireEvent } from "@testing-library/react";
import { getFormFields, renderTestEnvironment } from "../../../utils";
import { RegistrationNameInput } from "../../../../app/components/elements/inputs/RegistrationNameInput";
import { mockUserToUpdate } from "../../../../mocks/data";

const setUserToUpdateMock = jest.fn();

const getValidationMessage = (field: string) => {
  return document.getElementById(`${field}ValidationMessage`);
};

describe("RegistrationNameInput", () => {
  const setupTest = (props = {}) => {
    renderTestEnvironment({
      role: "ANONYMOUS",
      PageComponent: RegistrationNameInput,
      componentProps: {
        userToUpdate: mockUserToUpdate,
        setUserToUpdate: setUserToUpdateMock,
        attemptedSignUp: false,
        ...props,
      },
      initialRouteEntries: ["/register/student"],
    });
  };

  it("renders the component with first and last name inputs", () => {
    setupTest();
    const { givenName, familyName } = getFormFields();
    expect(givenName()).toBeInTheDocument();
    expect(familyName()).toBeInTheDocument();
  });

  it("updates user's first name in the userToUpdate object when input changes", () => {
    setupTest();
    const { givenName } = getFormFields();
    fireEvent.change(givenName(), { target: { value: "John" } });
    fireEvent.blur(givenName());
    expect(setUserToUpdateMock).toHaveBeenCalledWith({
      ...mockUserToUpdate,
      givenName: "John",
    });
  });

  it("updates user's last name in the userToUpdate object when input changes", () => {
    setupTest();
    const { familyName } = getFormFields();
    fireEvent.change(familyName(), { target: { value: "Test" } });
    fireEvent.blur(familyName());
    expect(setUserToUpdateMock).toHaveBeenCalledWith({
      ...mockUserToUpdate,
      familyName: "Test",
    });
  });

  it("displays validation message when givenName is invalid and signup attempted", () => {
    setupTest({
      userToUpdate: {
        ...mockUserToUpdate,
        givenName: "123*",
        familyName: "Test",
      },
      attemptedSignUp: true,
    });
    const firstNameError = getValidationMessage("givenName");
    expect(firstNameError?.textContent).toContain("Enter a valid name");
  });

  it("displays validation message when familyName is invalid and signup attempted", () => {
    setupTest({
      userToUpdate: {
        ...mockUserToUpdate,
        givenName: "Test",
        familyName: "123*",
      },
      attemptedSignUp: true,
    });
    const familyNameError = getValidationMessage("familyName");
    expect(familyNameError?.textContent).toContain("Enter a valid name");
  });

  it("displays two validation messages when both givenName and familyName are invalid and signup attempted", () => {
    setupTest({
      userToUpdate: {
        ...mockUserToUpdate,
        givenName: "123*",
        familyName: "123*",
      },
      attemptedSignUp: true,
    });
    const firstNameError = getValidationMessage("givenName");
    const familyNameError = getValidationMessage("familyName");
    [firstNameError, familyNameError].forEach((error) => {
      expect(error?.textContent).toContain("Enter a valid name");
    });
  });

  it("does not display validation message when both names are valid", () => {
    setupTest({
      userToUpdate: {
        ...mockUserToUpdate,
        givenName: "John",
        familyName: "Test",
      },
      attemptedSignUp: true,
    });
    const firstNameError = getValidationMessage("givenName");
    const familyNameError = getValidationMessage("familyName");
    [firstNameError, familyNameError].forEach((error) => {
      expect(error?.textContent).toHaveLength(0);
    });
  });
});

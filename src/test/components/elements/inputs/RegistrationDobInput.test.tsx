import { fireEvent, screen } from "@testing-library/react";
import { renderTestEnvironment } from "../../../utils";
import { RegistrationDobInput } from "../../../../app/components/elements/inputs/RegistrationDobInput";
import { mockUserToUpdate } from "../../../../mocks/data";

const mockSetUserToUpdate = jest.fn();
const mockSetDobOver13CheckboxChecked = jest.fn();

const getDateOfBirthInputs = () => {
  return ["day", "month", "year"].map((unit) =>
    screen.getByRole("combobox", {
      name: new RegExp(`${unit} of birth`, "i"),
    }),
  );
};

const getOver13Checkbox = () => {
  return screen.queryByRole("checkbox", {
    name: /i am at least 13 years old/i,
  });
};

const getDobFeedbackElement = () => {
  return document.getElementById("dob-validation-feedback") as HTMLElement;
};

describe("RegistrationDobInput", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const setupTest = (path: "/register/student" | "/register/teacher", props = {}) => {
    Object.defineProperty(window, "location", {
      value: {
        pathname: path,
      },
      writable: true,
    });

    renderTestEnvironment({
      role: "ANONYMOUS",
      PageComponent: RegistrationDobInput,
      componentProps: {
        userToUpdate: mockUserToUpdate,
        setUserToUpdate: mockSetUserToUpdate,
        submissionAttempted: false,
        dobOver13CheckboxChecked: false,
        setDobOver13CheckboxChecked: mockSetDobOver13CheckboxChecked,
        ...props,
      },
      initialRouteEntries: ["/"],
    });
  };

  it("renders correctly for student registration", () => {
    setupTest("/register/student");
    const dateOfBirthInputs = getDateOfBirthInputs();
    dateOfBirthInputs.forEach((input) => expect(input).toBeInTheDocument());
    const over13Checkbox = getOver13Checkbox();
    expect(over13Checkbox).toBeInTheDocument();
  });

  it("renders correctly for teacher registration", () => {
    setupTest("/register/teacher");
    const dateOfBirthInputs = getDateOfBirthInputs();
    dateOfBirthInputs.forEach((input) => expect(input).toBeInTheDocument());
    const over13Checkbox = getOver13Checkbox();
    expect(over13Checkbox).not.toBeInTheDocument();
  });

  it("changes the user details when the date of birth dropdowns are changed", () => {
    setupTest("/register/student");
    const dateOfBirthInputs = getDateOfBirthInputs();
    fireEvent.change(dateOfBirthInputs[0], { target: { value: "15" } });
    fireEvent.change(dateOfBirthInputs[1], { target: { value: "3" } });
    fireEvent.change(dateOfBirthInputs[2], { target: { value: "2006" } });
    const expectedDate = new Date("2006-03-15");
    expect(mockSetUserToUpdate).toHaveBeenCalledTimes(3);
    expect(mockSetUserToUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        dateOfBirth: expectedDate,
      }),
    );
  });

  it("unticks the over 13 checkbox with each change to date of birth dropdowns", () => {
    setupTest("/register/student");
    const dateOfBirthInputs = getDateOfBirthInputs();
    fireEvent.change(dateOfBirthInputs[0], { target: { value: "15" } });
    expect(mockSetDobOver13CheckboxChecked).toHaveBeenCalledTimes(1);
    fireEvent.change(dateOfBirthInputs[1], { target: { value: "3" } });
    expect(mockSetDobOver13CheckboxChecked).toHaveBeenCalledTimes(2);
    fireEvent.change(dateOfBirthInputs[2], { target: { value: "2006" } });
    expect(mockSetDobOver13CheckboxChecked).toHaveBeenCalledTimes(3);
    expect(mockSetDobOver13CheckboxChecked).toHaveBeenCalledWith(false);
  });

  it("updates the over-13 value if checkbox is clicked", () => {
    setupTest("/register/student");
    fireEvent.click(getOver13Checkbox() as HTMLElement);
    expect(mockSetDobOver13CheckboxChecked).toHaveBeenCalledTimes(1);
    expect(mockSetDobOver13CheckboxChecked).toHaveBeenCalledWith(true);
  });

  it("if user date of birth is over 13y old, the checkbox is disabled and no error message is shown", () => {
    setupTest("/register/student", {
      userToUpdate: {
        ...mockUserToUpdate,
        dateOfBirth: new Date("2006-03-15"),
      },
      dobOver13CheckboxChecked: true,
    });
    const over13Checkbox = getOver13Checkbox();
    expect(over13Checkbox).toBeDisabled();
    const dobValidationFeedbackElement = getDobFeedbackElement();
    expect(dobValidationFeedbackElement.textContent).toHaveLength(0);
  });

  it("if user date of birth is under 13y old, an error is shown", () => {
    const elevenYearsAgo = new Date();
    elevenYearsAgo.setFullYear(elevenYearsAgo.getFullYear() - 11);
    setupTest("/register/student", {
      userToUpdate: {
        ...mockUserToUpdate,
        dateOfBirth: elevenYearsAgo,
      },
    });
    const dateOfBirthInputs = getDateOfBirthInputs();
    dateOfBirthInputs.forEach((input) => expect(input).toBeInvalid());
    const over13Checkbox = getOver13Checkbox();
    expect(over13Checkbox).toBeInvalid();
    const dobValidationFeedbackElement = getDobFeedbackElement();
    expect(dobValidationFeedbackElement.textContent).toContain("Please enter a valid date of birth");
  });

  it("if date of birth is selected, user can clear it using X button", () => {
    setupTest("/register/student", {
      userToUpdate: {
        ...mockUserToUpdate,
        dateOfBirth: new Date("2006-03-15"),
      },
      over13CheckboxChecked: true,
    });
    const clearDobButton = screen.getByRole("button", {
      name: /clear date of birth/i,
    });
    fireEvent.click(clearDobButton);
    expect(mockSetUserToUpdate).toHaveBeenCalledTimes(1);
    expect(mockSetUserToUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        dateOfBirth: undefined,
      }),
    );
    expect(mockSetDobOver13CheckboxChecked).toHaveBeenCalledTimes(1);
    expect(mockSetDobOver13CheckboxChecked).toHaveBeenCalledWith(false);
  });

  it("show error if user selects Feb 29th in a non-leap year", () => {
    setupTest("/register/student", {
      userToUpdate: {
        ...mockUserToUpdate,
        dateOfBirth: new Date("2023-02-29"),
      },
    });
    const dobValidationFeedbackElement = getDobFeedbackElement();
    expect(dobValidationFeedbackElement.textContent).toContain("Please enter a valid date of birth");
  });
});

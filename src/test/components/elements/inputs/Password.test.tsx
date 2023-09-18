import { fireEvent, screen } from "@testing-library/react";
import Password from "../../../../app/components/elements/inputs/Password";
import { renderTestEnvironment } from "../../../utils";

describe("Password Component", () => {
  const setIsPasswordVisibleMock = jest.fn();
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();
  const mockOnFocus = jest.fn();

  const passwordFieldTypes = [
    { type: "New", expectedName: "new-password" },
    { type: "Confirm", expectedName: "password-confirm" },
    { type: "Current", expectedName: "current-password" },
  ] as const;

  const setupTest = (props = {}) => {
    renderTestEnvironment({
      role: "ANONYMOUS",
      PageComponent: Password,
      componentProps: {
        passwordFieldType: "New",
        isPasswordVisible: false,
        setIsPasswordVisible: setIsPasswordVisibleMock,
        onChange: mockOnChange,
        onBlur: mockOnBlur,
        onFocus: mockOnFocus,
        ...props,
      },
      initialRouteEntries: ["/register/student"],
    });
  };

  const findPasswordInput = (type: "New" | "Confirm" | "Current") => {
    const fieldType = passwordFieldTypes.find((field) => field.type === type);
    const selector = `input[name="${fieldType?.expectedName}"]`;
    return document.querySelector(selector) as HTMLInputElement;
  };

  const findToggleIcon = (type: "show" | "hide") => {
    return screen.getByTestId(`${type}-password-icon`);
  };

  describe("Event Handling", () => {
    test("handles onChange, onBlur, and onFocus events when typing", () => {
      setupTest();
      const passwordInput = findPasswordInput("New");
      fireEvent.change(passwordInput, { target: { value: "newPassword123" } });
      expect(mockOnChange).toHaveBeenCalledTimes(1);

      fireEvent.blur(passwordInput);
      expect(mockOnBlur).toHaveBeenCalledTimes(1);

      fireEvent.focus(passwordInput);
      expect(mockOnFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe("Toggle Icon", () => {
    test("shows toggle icon and handles click, changing password to visible", () => {
      setupTest({ showToggleIcon: true });
      const passwordInput = findPasswordInput("New");
      const toggleIcon = findToggleIcon("show");
      expect(passwordInput).toHaveAttribute("type", "password");
      fireEvent.click(toggleIcon);
      expect(setIsPasswordVisibleMock).toHaveBeenCalledTimes(1);
      expect(setIsPasswordVisibleMock).toHaveBeenCalledWith(true);
    });

    test("shows toggle icon and handles click, changing password to hidden", () => {
      setupTest({
        isPasswordVisible: true,
        showToggleIcon: true,
      });
      const passwordInput = findPasswordInput("New");
      expect(passwordInput).toHaveAttribute("type", "text");
      const hideIcon = findToggleIcon("hide");
      fireEvent.click(hideIcon);
      expect(setIsPasswordVisibleMock).toHaveBeenCalledTimes(1);
      expect(setIsPasswordVisibleMock).toHaveBeenCalledWith(false);
    });

    test("does not show toggle icon when 'showToggleIcon' prop is not provided", () => {
      setupTest();
      const toggleIcon = screen.queryByTestId("show-password-icon");
      expect(toggleIcon).toBeNull();
    });
  });

  describe("Rendering Styles", () => {
    test("renders with invalid style when 'invalid' prop is true", () => {
      setupTest({ invalid: true });
      const passwordInput = findPasswordInput("New");
      expect(passwordInput).toHaveClass("is-invalid");
    });

    passwordFieldTypes.forEach(({ type, expectedName }) => {
      test(`renders with correct name attribute for '${type}'`, () => {
        setupTest({
          passwordFieldType: type,
        });
        const passwordInput = findPasswordInput(type);
        expect(passwordInput.name).toBe(expectedName);
      });
    });

    test("renders with disabled attribute when 'disabled' prop is true", () => {
      setupTest({
        disabled: true,
      });
      const passwordInput = findPasswordInput("New");
      expect(passwordInput).toHaveAttribute("disabled");
    });

    test("renders with aria-describedby attribute when 'ariaDescribedBy' prop is provided", () => {
      const ariaDescribedByValue = "examplePasswordError";
      setupTest({
        ariaDescribedBy: ariaDescribedByValue,
      });
      const passwordInput = findPasswordInput("New");
      expect(passwordInput).toHaveAttribute(
        "aria-describedby",
        ariaDescribedByValue
      );
    });
  });
});

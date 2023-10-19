import { UserRole } from "../IsaacApiTypes";
import { render } from "@testing-library/react/pure";
import { server } from "../mocks/server";
import { rest, RestHandler } from "msw";
import { ACTION_TYPE, API_PATH } from "../app/services";
import { produce } from "immer";
import { mockUser, registrationUserData } from "../mocks/data";
import { isaacApi, requestCurrentUser, store } from "../app/state";
import { Provider } from "react-redux";
import { IsaacApp } from "../app/components/navigation/IsaacApp";
import React from "react";
import { isDefined } from "../app/services";
import { MemoryRouter } from "react-router";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const augmentErrorMessage = (message?: string) => (e: Error) => {
  return new Error(`${e.message}\n${message ? "Extra info: " + message : ""}`);
};

export type TestUserRole = UserRole | "ANONYMOUS";

interface RenderTestEnvironmentOptions {
  role?: TestUserRole;
  modifyUser?: (u: typeof mockUser) => typeof mockUser;
  PageComponent?: React.FC<any>;
  componentProps?: Record<string, any>;
  initialRouteEntries?: string[];
  extraEndpoints?: RestHandler<any>[];
}
// Flexible helper function to setup different kinds of test environments. You can:
//  - Choose the role of the mock user (defaults to ADMIN)
//  - Apply an arbitrary transformation to the mock user
//  - Choose which page component you want  to render (if it is omitted, IsaacApp will be rendered)
//  - Define extra endpoint handlers for the MSW server (will have priority over existing ones)
//  - Setup the initial history of the routing component (doesn't apply if IsaacApp is being rendered in full)
// If IsaacApp is rendered, it won't be wrapped in another router. Any component will be wrapped in a Redux
// Provider with the global store.
// When called, the Redux store will be cleaned completely, and other the MSW server handlers will be reset to
// defaults (those in handlers.ts).
export const renderTestEnvironment = (options?: RenderTestEnvironmentOptions) => {
  const { role, modifyUser, PageComponent, componentProps, initialRouteEntries, extraEndpoints } = options ?? {};
  store.dispatch({ type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS });
  store.dispatch(isaacApi.util.resetApiState());
  server.resetHandlers();
  if (role || modifyUser) {
    server.use(
      rest.get(API_PATH + "/users/current_user", (req, res, ctx) => {
        if (role === "ANONYMOUS") {
          return res(
            ctx.status(401),
            ctx.json({
              responseCode: 401,
              responseCodeType: "Unauthorized",
              errorMessage: "You must be logged in to access this resource.",
              bypassGenericSiteErrorPage: false,
            }),
          );
        }
        const userWithRole = produce(mockUser, (user) => {
          user.role = role ?? mockUser.role;
        });
        return res(ctx.status(200), ctx.json(modifyUser ? modifyUser(userWithRole) : userWithRole));
      }),
    );
  }
  if (extraEndpoints) {
    server.use(...extraEndpoints);
  }
  if (isDefined(PageComponent) && PageComponent.name !== "IsaacApp") {
    store.dispatch(requestCurrentUser());
  }
  render(
    <Provider store={store}>
      {PageComponent ? (
        <MemoryRouter initialEntries={initialRouteEntries ?? []}>
          <PageComponent {...componentProps} />
        </MemoryRouter>
      ) : (
        <IsaacApp />
      )}
    </Provider>,
  );
};

export type NavBarMenus = "My Isaac" | "Teach" | "Learn" | "Events" | "Help" | "Admin";
export const NAV_BAR_MENU_TITLE: { [menu in NavBarMenus]: string } = {
  "My Isaac": "My Isaac",
  Teach: "Teachers",
  Learn: "Learn",
  Events: "Events",
  Help: "Help and support",
  Admin: "Admin",
};

// Clicks on the given navigation menu entry, allowing navigation around the app as a user would
export const followHeaderNavLink = async (menu: NavBarMenus, linkName: string) => {
  const header = await screen.findByTestId("header");
  const navLink = await within(header).findByRole("link", {
    name: NAV_BAR_MENU_TITLE[menu],
  });
  await userEvent.click(navLink);
  // This isn't strictly implementation agnostic, but I cannot work out a better way of getting the menu
  // related to a given title
  const adminMenuSectionParent = navLink.closest("li[class*='nav-item']") as HTMLLIElement | null;
  if (!adminMenuSectionParent)
    fail(`Missing NavigationSection parent - cannot locate entries in ${menu} navigation menu.`);
  const link = await within(adminMenuSectionParent).findByRole("menuitem", {
    name: linkName,
    exact: false,
  });
  await userEvent.click(link);
};

export const dayMonthYearStringToDate = (d?: string) => {
  if (!d) return undefined;
  const parts = d.split("/").map((n) => parseInt(n, 10));
  return new Date(parts[2], parts[1] - 1, parts[0], 0, 0, 0, 0);
};

export const ONE_DAY_IN_MS = 86400000;
export const DDMMYYYY_REGEX = /\d{2}\/\d{2}\/\d{4}/;

export const NOW = Date.now(); // Use same "now" for all time relative calculations
export const DAYS_AGO = (n: number, roundDownToNearestDate = false) => {
  const d = new Date(NOW);
  d.setUTCDate(d.getUTCDate() - n);
  if (roundDownToNearestDate) d.setHours(0, 0, 0, 0);
  return d.valueOf();
};

export const getById = (id: string) => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with ID "${id}" not found.`);
  }
  return element;
};

export const fillTextField = async (field: HTMLElement, value: string): Promise<void> => {
  await userEvent.click(field);
  await userEvent.type(field, value);
};

export const selectOption = async (selectElement: HTMLElement, optionValue: string): Promise<void> => {
  await userEvent.click(selectElement);
  await userEvent.selectOptions(selectElement, optionValue);
};

export const checkPageTitle = (pageTitle: string) => {
  const title = screen.getByRole("heading", {
    name: new RegExp(pageTitle, "i"),
  });
  expect(title).toBeInTheDocument();
};

export const checkPasswordInputTypes = (expectedType: string) => {
  const formFields = getFormFields();
  const passwordInput = formFields.password() as HTMLInputElement;
  const confirmPasswordInput = formFields.confirmPassword() as HTMLInputElement;
  [passwordInput, confirmPasswordInput].forEach((input) => expect(input.type).toBe(expectedType));
};

export const clickButton = async (buttonName: string) => {
  const button = screen.getByRole("button", { name: buttonName });
  await userEvent.click(button);
};

// helper for finding fields in registration forms
export const getFormFields = () => {
  const formFields = {
    givenName: () => screen.getByRole("textbox", { name: "First name" }),
    familyName: () => screen.getByRole("textbox", { name: "Last name" }),
    currentSchool: () => screen.getByRole("combobox", { name: "My current school or college" }),
    dob: () => screen.getByText(/Date of birth/i),
    overThirteen: () => screen.getByRole("checkbox", { name: /13 years old/i }),
    noSchool: () => screen.getByRole("checkbox", { name: /not associated with a school/i }),
    email: () => screen.getByRole("textbox", { name: "Email address" }),
    gender: () => screen.getByRole("combobox", { name: "Gender" }),
    password: () => screen.getByLabelText("Password", { selector: "input" }),
    confirmPassword: () => screen.getByLabelText("Re-enter password", { selector: "input" }),
    stage: () => screen.getByRole("combobox", { name: "Stage" }) as HTMLSelectElement,
    examBoard: () => screen.getByRole("combobox", { name: "Exam Board" }),
    addAnotherStage: () => screen.getByRole("button", { name: /add stage/i }),
    verificationInfo: () => screen.getByRole("textbox", { name: /url of a page/i }),
    assignmentPreferences: () => screen.queryByRole("cell", { name: /receive assignment/i }),
    newsPreferences: () => screen.getByRole("radio", { name: /no for news_and_updates/i }),
    events: () => screen.getByRole("radio", { name: /no for events/i }),
    additionalInfo: () => screen.getByRole("textbox", { name: /any other information/i }),
    otherInfo: () => screen.getByRole("textbox", { name: /other information/i }),
    submitButton: () => screen.getByRole("button", { name: "Register my account" }),
    recaptcha: () => screen.getByTestId("mock-recaptcha-checkbox"),
  };

  return formFields;
};

// helper for filling in registration forms
export const fillFormCorrectly = async (correctly: boolean, role: "teacher" | "student") => {
  const formFields = getFormFields();

  switch (role) {
    case "teacher": {
      const {
        givenName,
        familyName,
        noSchool,
        email,
        gender,
        password,
        confirmPassword,
        stage,
        verificationInfo,
        newsPreferences,
        events,
        otherInfo,
        recaptcha,
      } = formFields;

      await fillTextField(givenName(), registrationUserData.givenName);
      await fillTextField(familyName(), registrationUserData.familyName);
      await selectOption(gender(), registrationUserData.gender);
      await fillTextField(verificationInfo(), registrationUserData.verificationInfo);

      if (correctly) {
        await fillTextField(password(), registrationUserData.password);
        await fillTextField(confirmPassword(), registrationUserData.password);
        await userEvent.click(newsPreferences());
        await userEvent.click(events());
        await userEvent.click(noSchool());
        await selectOption(stage(), registrationUserData.stage);
        await fillTextField(otherInfo(), "extra information");
        await fillTextField(email(), registrationUserData.email);
      } else {
        await fillTextField(password(), registrationUserData.wrongPassword);
        await fillTextField(confirmPassword(), registrationUserData.wrongPassword);
        await fillTextField(email(), registrationUserData.wrongEmail);
      }
      await userEvent.click(recaptcha());
      break;
    }

    case "student": {
      const {
        givenName,
        familyName,
        noSchool,
        overThirteen,
        email,
        gender,
        stage,
        password,
        confirmPassword,
        newsPreferences,
        events,
        recaptcha,
      } = formFields;
      await fillTextField(givenName(), registrationUserData.givenName);
      await fillTextField(familyName(), registrationUserData.familyName);
      await userEvent.click(noSchool());
      await userEvent.click(overThirteen());
      await fillTextField(email(), registrationUserData.email);
      await selectOption(gender(), registrationUserData.gender);
      await selectOption(stage(), registrationUserData.stage);
      if (correctly) {
        await fillTextField(password(), registrationUserData.password);
        await fillTextField(confirmPassword(), registrationUserData.password);
        await userEvent.click(newsPreferences());
        await userEvent.click(events());
      } else {
        await fillTextField(password(), registrationUserData.wrongPassword);
        await fillTextField(confirmPassword(), registrationUserData.wrongPassword);
      }
      await userEvent.click(recaptcha());
      break;
    }
  }
};

export const extraDownloadEndpoints = {
  working: [
    rest.get(API_PATH + `/documents/content/books/gcse_book_23/isaac_cs_gcse_book_2023.pdf`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ data: "this is a book" }));
    }),
    rest.get(API_PATH + `/documents/content/books/workbook_20_aqa/isaac_cs_aqa_book_2022.pdf`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ data: "this is a book" }));
    }),
    rest.get(API_PATH + `/documents/content/books/workbook_20_ocr/isaac_cs_ocr_book_2022.pdf`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ data: "this is a book" }));
    }),
  ],
  broken: [
    rest.get(API_PATH + `/documents/content/books/gcse_book_23/isaac_cs_gcse_book_2023.pdf`, (req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json({
          responseCode: 404,
          responseCodeType: "Not Found",
          errorMessage: "Unable to locate the file: content/books/gcse_book_23/isaac_cs_gcse_book_2023.pdf.",
          bypassGenericSiteErrorPage: false,
        }),
      );
    }),
    rest.get(API_PATH + `/documents/content/books/workbook_20_ocr/isaac_cs_ocr_book_2022.pdf`, (req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json({
          responseCode: 404,
          responseCodeType: "Not Found",
          errorMessage: "Unable to locate the file: content/books/workbook_20_ocr/isaac_cs_ocr_book_2022.pdf.",
          bypassGenericSiteErrorPage: false,
        }),
      );
    }),
    rest.get(API_PATH + `/documents/content/books/workbook_20_ocr/isaac_cs_ocr_book_2022`, (req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json({
          responseCode: 404,
          responseCodeType: "Not Found",
          errorMessage: "Unable to locate the file: /content/books/workbook_20_ocr/isaac_cs_ocr_book_2022.",
          bypassGenericSiteErrorPage: false,
        }),
      );
    }),
  ],
};

export const getDownloadButtons = () => {
  const gcseButton = () =>
    screen.getByRole("button", {
      name: /download gcse workbook/i,
    });
  const aqaButton = () =>
    screen.getByRole("button", {
      name: /download aqa workbook/i,
    });
  const ocrButton = () =>
    screen.getByRole("button", {
      name: /download ocr workbook/i,
    });
  return { gcseButton, aqaButton, ocrButton };
};

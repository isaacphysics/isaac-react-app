import { EventBookingForm } from "../../../app/components/elements/EventBookingForm";
import { renderTestEnvironment } from "../../utils";
import { mockEvent, mockUser } from "../../../mocks/data";
import {
  EmailVerificationStatus,
  RegisteredUserDTO,
  Role,
  UserSummaryWithEmailAddressDTO,
} from "../../../IsaacApiTypes";
import { API_PATH, augmentEvent } from "../../../app/services";
import { AdditionalInformation, AugmentedEvent } from "../../../IsaacAppTypes";
import { Immutable } from "immer";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import * as actions from "../../../app/state/actions";

const requestEmailVerificationSpy = jest.spyOn(actions, "requestEmailVerification");
const updateAdditionalInformation = jest.fn();

describe("EventBookingForm", () => {
  const setupTest = ({
    role,
    event,
    user,
    additionalInformation,
  }: {
    role: Role;
    event?: AugmentedEvent;
    user: RegisteredUserDTO;
    additionalInformation?: AdditionalInformation;
  }) => {
    const mockUserSummary: Immutable<UserSummaryWithEmailAddressDTO> = {
      givenName: user.givenName,
      familyName: user.familyName,
      role: role,
      emailVerificationStatus: user.emailVerificationStatus,
      registeredContexts: user.registeredContexts,
      id: user.id,
      teacherPending: user.teacherPending,
    };

    renderTestEnvironment({
      role: role,
      PageComponent: EventBookingForm,
      componentProps: {
        event: event || augmentEvent(mockEvent),
        targetUser: mockUserSummary,
        additionalInformation: additionalInformation || {},
        updateAdditionalInformation: updateAdditionalInformation,
      },
      initialRouteEntries: [`/events/${mockEvent.id}`],
      extraEndpoints: [
        rest.post(API_PATH + `/users/verifyemail`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({}));
        }),
      ],
    });
  };

  it("component renders", () => {
    setupTest({ role: "STUDENT", user: mockUser });
    const accountInformation = screen.getByTestId("booking-account-info");
    const eventBookingDetails = screen.getByTestId("event-booking-details");
    expect(accountInformation).toBeInTheDocument();
    expect(eventBookingDetails).toBeInTheDocument();
  });

  const inputFields = [
    "First name",
    "Last name",
    "Email address",
    "Stage",
    "Exam board",
    "My current school or college",
  ];
  it.each(inputFields)("%s input field renders and is disabled", async (input) => {
    setupTest({ role: "STUDENT", user: mockUser });
    await screen.findByDisplayValue(mockUser.givenName!);

    const inputField = screen.getByLabelText(input);
    expect(inputField).toBeInTheDocument();
    expect(inputField).toBeDisabled();
  });

  it("if email address is unverified, warning message is displayed", () => {
    const user = { ...mockUser, emailVerificationStatus: "NOT_VERIFIED" as EmailVerificationStatus };
    setupTest({ role: "STUDENT", user: user });
    const warningMessage = screen.getByTestId("email-feedback");
    expect(warningMessage).toBeVisible();
  });

  it("if user is booking for themselves and email is unverified, link to verify is provided", async () => {
    const user = { ...mockUser, emailVerificationStatus: "NOT_VERIFIED" as EmailVerificationStatus };
    setupTest({ role: "STUDENT", user: user });
    const verifyEmailLink = await screen.findByRole("button", { name: /verify your email before booking/i });
    expect(verifyEmailLink).toBeInTheDocument();
  });

  it("if the button to verify email is clicked, a confirmation message is displayed and verification email is sent", async () => {
    const user = { ...mockUser, emailVerificationStatus: "NOT_VERIFIED" as EmailVerificationStatus };
    setupTest({ role: "STUDENT", user: user });
    const verifyEmailLink = await screen.findByRole("button", { name: /verify your email before booking/i });
    await userEvent.click(verifyEmailLink);
    const verifyEmailMessage = screen.getByText(/we have sent an email/i);
    expect(verifyEmailMessage).toBeInTheDocument();
    expect(requestEmailVerificationSpy).toHaveBeenCalled();
  });

  it("if user is a student, it displays School Year Group input with correct options", () => {
    setupTest({ role: "STUDENT", user: mockUser });
    const schoolYearGroup = screen.getByLabelText("School year group");
    expect(schoolYearGroup).toBeEnabled();
    const options = schoolYearGroup.querySelectorAll("option");
    expect(options).toHaveLength(8);
    const yearGroups = ["", "9", "10", "11", "12", "13", "TEACHER", "OTHER"];
    options.forEach((option, index) => {
      expect(option).toHaveValue(yearGroups[index]);
    });
  });

  it("if the event is student only, the event booking details card displays a warning message", () => {
    const event = augmentEvent(mockEvent);
    setupTest({ role: "STUDENT", user: mockUser, event: { ...event, isStudentOnly: true } });
    const warningMessage = screen.getByTestId("student-only");
    expect(warningMessage).toBeInTheDocument();
  });

  it("if user is not a student, Job title is requested", () => {
    setupTest({ role: "TEACHER", user: mockUser });
    const jobTitle = screen.getByLabelText("Job title");
    expect(jobTitle).toBeInTheDocument();
    fireEvent.change(jobTitle, { target: { value: "Head of CS" } });
    expect(updateAdditionalInformation).toHaveBeenCalledWith({ jobTitle: "Head of CS" });
  });

  it("if event is not virtual, dietary requirements are requested", () => {
    const event = augmentEvent(mockEvent);
    setupTest({ role: "STUDENT", user: mockUser, event: { ...event, isVirtual: false } });
    const dietaryRequirements = screen.getByLabelText(/dietary requirements/i);
    expect(dietaryRequirements).toBeInTheDocument();
    fireEvent.change(dietaryRequirements, { target: { value: "Vegan" } });
    expect(updateAdditionalInformation).toHaveBeenCalledWith({ dietaryRequirements: "Vegan" });
  });

  it("if event is not virtual, accessibility requirements are requested", () => {
    const event = augmentEvent(mockEvent);
    setupTest({ role: "STUDENT", user: mockUser, event: { ...event, isVirtual: false } });
    const accessibilityRequirements = screen.getByLabelText(/accessibility requirements/i);
    expect(accessibilityRequirements).toBeInTheDocument();
    fireEvent.change(accessibilityRequirements, { target: { value: "Wheelchair access" } });
    expect(updateAdditionalInformation).toHaveBeenCalledWith({ accessibilityRequirements: "Wheelchair access" });
  });

  it.each`
    testCase              | label                          | value           | expected
    ${"contact name"}     | ${/contact name/i}             | ${"John Smith"} | ${{ emergencyName: "John Smith" }}
    ${"telephone number"} | ${/contact telephone number/i} | ${"0123456789"} | ${{ emergencyNumber: "0123456789" }}
  `(
    "if user is not a teacher and event is not virtual, emergency $testCase is requested",
    ({ label, value, expected }) => {
      const event = augmentEvent(mockEvent);
      setupTest({ role: "STUDENT", user: mockUser, event: { ...event, isVirtual: false } });

      const emergencyContactDetailsHeading = screen.getByRole("heading", { name: /emergency contact details/i });
      expect(emergencyContactDetailsHeading).toBeInTheDocument();

      const element = screen.getByLabelText(label);
      expect(element).toBeInTheDocument();
      expect(element).toBeEnabled();
      fireEvent.change(element, { target: { value } });
      expect(updateAdditionalInformation).toHaveBeenCalledWith(expected);
    },
  );

  it("if event is not virtual, it displays a message to advise PII information will be deleted after 30 days", () => {
    const event = augmentEvent(mockEvent);
    setupTest({ role: "STUDENT", user: mockUser, event: { ...event, isVirtual: false } });
    const piiMessage = screen.getByTestId("pii-message");
    expect(piiMessage).toBeInTheDocument();
  });
});

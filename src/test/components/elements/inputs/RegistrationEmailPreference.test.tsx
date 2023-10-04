import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { RegistrationEmailPreference } from "../../../../app/components/elements/inputs/RegistrationEmailPreference";
import { TestUserRole, renderTestEnvironment } from "../../../utils";

describe("RegistrationEmailPreference", () => {
  const mockSetEmailPreferences = jest.fn();
  const preferences = ["NEWS_AND_UPDATES", "ASSIGNMENTS", "EVENTS"];

  const getOptions = {
    assignments: () => screen.getByText("Assignments"),
    news: () => screen.getByText("News"),
    events: () => screen.getByText("Events"),
    assignmentsDescription: () =>
      screen.getByText("Receive assignment notifications from your teacher."),
    newsDescription: () =>
      screen.getByText(
        "Be the first to know about new topics, new platform features, and our fantastic competition giveaways."
      ),
    eventsDescription: () =>
      screen.getByText(
        "Get valuable updates on our free student workshops happening near you."
      ),
  };

  const setupTest = (role: TestUserRole, props = {}) => {
    renderTestEnvironment({
      role: "ANONYMOUS",
      PageComponent: RegistrationEmailPreference,
      componentProps: {
        emailPreferences: undefined,
        setEmailPreferences: mockSetEmailPreferences,
        submissionAttempted: false,
        userRole: role,
        ...props,
      },
      initialRouteEntries: ["/register/student"],
    });
  };

  it("renders correct options for student registration", () => {
    setupTest("STUDENT");
    const {
      assignments,
      news,
      events,
      assignmentsDescription,
      newsDescription,
      eventsDescription,
    } = getOptions;
    const allOptions = [
      assignments(),
      assignmentsDescription(),
      news(),
      newsDescription(),
      events(),
      eventsDescription(),
    ];
    allOptions.forEach((option) => {
      expect(option).toBeInTheDocument();
    });
  });

  it("renders correct options for teacher registration", () => {
    setupTest("TEACHER");
    const { news, newsDescription, events, eventsDescription } = getOptions;
    [news(), newsDescription(), events(), eventsDescription()].forEach(
      (option) => {
        expect(option).toBeInTheDocument();
      }
    );
    const assignmentsOption = screen.queryByText("Assignments");
    const assignmentsDescription = screen.queryByText(
      "Receive assignment notifications from your teacher."
    );
    expect(assignmentsOption).not.toBeInTheDocument();
    expect(assignmentsDescription).not.toBeInTheDocument();
  });

  it.each(preferences)(
    "handles preference changes for %s correctly",
    async (option) => {
      setupTest("STUDENT");
      const falseOption = new RegExp(`No.*for ${option}`);
      const trueOption = new RegExp(`Yes.*for ${option}`);
      const preferenceFalseLabel = screen.getByLabelText(falseOption);
      await userEvent.click(preferenceFalseLabel);
      const expectedFalse = { [option]: false };
      expect(mockSetEmailPreferences).toHaveBeenCalledWith(
        expect.objectContaining(expectedFalse)
      );
      const preferenceTrueLabel = screen.getByLabelText(trueOption);
      await userEvent.click(preferenceTrueLabel);
      const expectedTrue = { [option]: true };
      expect(mockSetEmailPreferences).toHaveBeenCalledWith(
        expect.objectContaining(expectedTrue)
      );
    }
  );

  it("if form submission is attempted but not all preferences are selected, affected options are marked as invalid, and 'required' feedback shows", () => {
    setupTest("STUDENT", {
      submissionAttempted: true,
      emailPreferences: { ASSIGNMENTS: false, EVENTS: true },
    });
    const newsPreferenceTrueLabel = screen.getByLabelText(
      /Yes.*for NEWS_AND_UPDATES/
    );
    const newsPreferenceFalseLabel = screen.getByLabelText(
      /No.*for NEWS_AND_UPDATES/
    );
    expect(newsPreferenceTrueLabel).toBeInvalid();
    expect(newsPreferenceFalseLabel).toBeInvalid();
    const emailPreferenceFeedback = screen.getByText("required", {
      selector: "#news-feedback",
    });
    expect(emailPreferenceFeedback).toBeInTheDocument();
  });

  it("if form submission has been attempted and all options were correctly selected, no error message shows", () => {
    setupTest("STUDENT", {
      submissionAttempted: true,
      emailPreferences: {
        ASSIGNMENTS: false,
        EVENTS: true,
        NEWS_AND_UPDATES: true,
      },
    });
    preferences.forEach((option) => {
      const trueLabel = screen.getByLabelText(`Yes for ${option}`);
      const falseLabel = screen.getByLabelText(`No for ${option}`);
      expect(trueLabel).toBeValid();
      expect(falseLabel).toBeValid();
      const feedbackId = `#${option.toLowerCase()}-feedback`;
      const feedbackElement = screen.queryByText("required", {
        selector: feedbackId,
      });
      expect(feedbackElement).toBeNull();
    });
  });
});

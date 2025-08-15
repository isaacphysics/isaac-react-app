import { rest } from "msw";
import { Role } from "../../../../IsaacApiTypes";
import { API_PATH, api } from "../../../../app/services";
import { renderTestEnvironment } from "../../../utils";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const oneWeekFromNow = new Date().getTime() + 1000 * 60 * 60 * 24 * 7;

const studentSurvey = {
  id: "example_student_survey",
  type: "notification",
  tags: ["student"],
  title: "Example student survey",
  encoding: "markdown",
  children: [],
  value: "This is an example",
  published: true,
  externalReference: {
    title: "Example Student Survey",
    url: "https://example.com",
  },
  expiry: oneWeekFromNow,
};

const teacherSurvey = {
  id: "example_student_survey",
  type: "notification",
  tags: ["teacher", "event_leader"],
  title: "Example teacher survey",
  encoding: "markdown",
  children: [],
  value: "This is an example",
  published: true,
  externalReference: {
    title: "Example Teacher Survey",
    url: "https://example.com",
  },
  expiry: oneWeekFromNow,
};

describe("Notification Modal", () => {
  const setupTest = (role: Role) => {
    let notification: typeof studentSurvey | null;
    switch (role) {
      case "STUDENT":
        notification = studentSurvey;
        break;
      case "TEACHER":
      case "EVENT_LEADER":
        notification = teacherSurvey;
        break;
      default:
        notification = null;
        break;
    }

    renderTestEnvironment({
      role: role,
      extraEndpoints: [
        rest.get(API_PATH + `/notifications`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json([notification]));
        }),
        rest.post(API_PATH + `/notifications/${notification?.id}/:status`, (req, res, ctx) => {
          return res(ctx.status(204), ctx.json({}));
        }),
      ],
    });
  };

  it.each(["STUDENT", "TEACHER", "EVENT_LEADER"] as Role[])(
    "renders correct survey notification for %s",
    async (role) => {
      setupTest(role);
      await screen.findByTestId("main");
      const modal = await screen.findByTestId("active-modal");
      const expectedTitle = role === "STUDENT" ? studentSurvey.title : teacherSurvey.title;
      expect(modal).toHaveModalTitle(expectedTitle);
    },
  );

  it("shows expected buttons", async () => {
    setupTest("STUDENT");
    const modal = await screen.findByTestId("active-modal");
    const buttons = within(modal).getAllByRole("button");
    const expectedButtons = ["Close", "Yes, view questionnaire", "No thanks", "Ask me later"];
    buttons.map((each, index) => expect(each).toHaveTextContent(expectedButtons[index]));
    expect(buttons).toHaveLength(expectedButtons.length);
  });

  it("opens window with survey if 'Yes, view questionnaire' is clicked, and records response", async () => {
    jest.spyOn(window, "open").mockImplementation(jest.fn());
    jest.spyOn(api.notifications, "respond");
    setupTest("STUDENT");
    const modal = await screen.findByTestId("active-modal");
    const buttons = within(modal).getAllByRole("button");
    const surveyButton = buttons[1];
    await userEvent.click(surveyButton);
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining(studentSurvey.externalReference.url), "_blank");
    expect(api.notifications.respond).toHaveBeenCalledWith(studentSurvey.id, "ACKNOWLEDGED");
  });

  it("records response if 'No thanks' is pressed", async () => {
    jest.spyOn(api.notifications, "respond");
    setupTest("STUDENT");
    const modal = await screen.findByTestId("active-modal");
    const buttons = within(modal).getAllByRole("button");
    const surveyButton = buttons[2];
    await userEvent.click(surveyButton);
    expect(api.notifications.respond).toHaveBeenCalledWith(studentSurvey.id, "DISABLED");
  });

  it("records response if 'Ask me later' is pressed", async () => {
    jest.spyOn(api.notifications, "respond");
    setupTest("STUDENT");
    const modal = await screen.findByTestId("active-modal");
    const buttons = within(modal).getAllByRole("button");
    const surveyButton = buttons[3];
    await userEvent.click(surveyButton);
    expect(api.notifications.respond).toHaveBeenCalledWith(studentSurvey.id, "POSTPONED");
  });
});

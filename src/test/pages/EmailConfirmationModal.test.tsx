import { screen, waitFor, within } from "@testing-library/react";
import { produce } from "immer";
import { renderTestEnvironment } from "../utils";
import userEvent from "@testing-library/user-event";
import * as actions from "../../app/state/actions";
import { rest } from "msw";
import { API_PATH } from "../../app/services";

const requestEmailVerificationSpy = jest.spyOn(actions, "requestEmailVerification");

describe("EmailConfirmationModal", () => {
  it("If the user does not have a teacherPending: true flag, the modal will not appear", async () => {
    renderTestEnvironment({
      modifyUser: (user) =>
        produce(user, (u) => {
          u.role = "STUDENT";
          u.emailVerificationStatus = "NOT_VERIFIED";
        }),
    });
    await waitFor(() => {
      const modal = screen.queryByTestId("active-modal");
      expect(modal).toBeNull();
    });
  });

  it("If the user has a teacherPending: true flag, but email is VERIFIED the modal will not appear", async () => {
    renderTestEnvironment({
      modifyUser: (user) =>
        produce(user, (u) => {
          u.role = "STUDENT";
          u.teacherPending = true;
          u.emailVerificationStatus = "VERIFIED";
        }),
    });
    await waitFor(() => {
      const modal = screen.queryByTestId("active-modal");
      expect(modal).toBeNull();
    });
  });

  it("If the user has a teacherPending: true flag, and email NOT_VERIFIED the modal will appear, with the correct text", async () => {
    renderTestEnvironment({
      modifyUser: (user) =>
        produce(user, (u) => {
          u.role = "STUDENT";
          u.emailVerificationStatus = "NOT_VERIFIED";
          u.teacherPending = true;
        }),
    });
    const modal = await screen.findByTestId("active-modal");
    expect(modal).toHaveModalTitle("Verify your email address");
    expect(modal).toHaveTextContent("please find our email in your inbox");
    const resetEmailButton = within(modal).getByRole("button", {
      name: "Re-send email",
    });
    expect(resetEmailButton).toBeVisible();
  });

  it("Pressing the re-send button will trigger a new email to be sent", async () => {
    renderTestEnvironment({
      extraEndpoints: [
        rest.post(API_PATH + "/users/verifyemail", (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({}));
        }),
      ],
      modifyUser: (user) =>
        produce(user, (u) => {
          u.role = "STUDENT";
          u.emailVerificationStatus = "NOT_VERIFIED";
          u.teacherPending = true;
        }),
    });
    const modal = await screen.findByTestId("active-modal");
    expect(modal).toHaveModalTitle("Verify your email address");
    const resetEmailButton = within(modal).getByRole("button", {
      name: "Re-send email",
    });
    await userEvent.click(resetEmailButton);
    expect(requestEmailVerificationSpy).toBeCalled();
  });

  it("If user has teacherPending: true and email status 'DELIVERY_FAILED' the modal displays with different text", async () => {
    renderTestEnvironment({
      modifyUser: (user) =>
        produce(user, (u) => {
          u.role = "STUDENT";
          u.emailVerificationStatus = "DELIVERY_FAILED";
          u.teacherPending = true;
        }),
    });
    const modal = await screen.findByTestId("active-modal");
    expect(modal).toHaveTextContent("One or more email(s) sent to your email address failed.");
  });
});

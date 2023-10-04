import {screen} from "@testing-library/react";
import { produce } from "immer";
import {renderTestEnvironment} from "../utils";
import { API_PATH } from "../../app/services";
import {rest} from "msw";
import { mockIncompleteUserPreferences } from "../../mocks/data";

describe("RequiredInformationModal", () => {

    it('should show if user does not have all required information in their account', async () => {
        renderTestEnvironment({modifyUser: user => produce(user, u => {
            u.gender = "UNKNOWN";
            })});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        const modal = await screen.findByTestId("active-modal");
        expect(modal).toHaveModalTitle("Required account information");
    });

    it('should not show if the user has all required account information', async () => {
        renderTestEnvironment({role: "STUDENT"});
        await screen.findByTestId("main");
        const modals = screen.queryAllByTestId("active-modal");
        if (modals.length > 0) {
            // If there is another modal, it shouldn't be the required info one
            expect(modals[0]).not.toHaveModalTitle("Required account information");
            // There should only be one modal on the screen at a time
            expect(modals).toHaveLength(1);
        } else {
            expect(modals).toHaveLength(0);
        }
    });

    it('should offer assignments email option to students', async () => {
        renderTestEnvironment({
            role: "STUDENT",
            extraEndpoints: [
                    rest.get(API_PATH + "/users/user_preferences", (req, res, ctx) => {
                        return res(
                            ctx.status(200),
                            ctx.json(mockIncompleteUserPreferences)
                        );
                    }),
                ]});
          // wait for modal content to be loaded    
          await screen.findByTestId("active-modal");
            // find assignments email option
          const assignmentsEmailOption = screen.getByRole('cell', {
              name: /receive assignment notifications from your teacher\./i
            })
          expect(assignmentsEmailOption).toBeVisible();
    });

    it('does not offer assignments email option to teachers', async () => {
        renderTestEnvironment({
            role: "TEACHER",
            extraEndpoints: [
                    rest.get(API_PATH + "/users/user_preferences", (req, res, ctx) => {
                        return res(
                            ctx.status(200),
                            ctx.json(mockIncompleteUserPreferences)
                        );
                    }),
                ]});
          // wait for modal content to be loaded    
          await screen.findByTestId("active-modal");
            // find assignments email option
          const assignmentsEmailOption = screen.queryByText(/receive assignment notifications from your teacher\./i)
          expect(assignmentsEmailOption).not.toBeInTheDocument();
    });

});
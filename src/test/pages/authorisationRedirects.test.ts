import {renderTestEnvironment} from "./utils";
import {cleanup, screen, waitFor} from "@testing-library/react/pure";
import {history, siteSpecific} from "../../app/services";

describe("Visiting a teacher-only page", () => {

    it('should redirect anonymous users to login', async () => {
        renderTestEnvironment({role: "ANONYMOUS"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        history.replace("/set_assignments");
        await waitFor(() => {
            expect(history.location.pathname).toEqual("/login");
        });
        cleanup();
    });

    it('should redirect student users to teacher account contact page', async () => {
        renderTestEnvironment({role: "STUDENT"});
        // Wait for main content to be loaded
        await screen.findByTestId("main");
        history.replace("/set_assignments");
        await waitFor(() => {
            expect(history.location.pathname).toEqual(siteSpecific("/pages/contact_us_teacher", "/pages/teacher_accounts"));
        });
        cleanup();
    });
});
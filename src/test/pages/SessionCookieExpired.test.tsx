import {navigateToMyAccount, renderTestEnvironment} from "../testUtils";
import {NOW, SOME_FIXED_FUTURE_DATE} from "../dateUtils";
import {redirectTo} from "../../app/state";
import * as Actions from "../../app/state/actions";


describe("SessionExpired", () => {
    it('should redirect to session expired login page when session has expired', async () => {
        // Arrange
        //  Annoyingly, the hard-redirect we use is not implemented in JSDOM/RTL, so we need to mock it out.
        jest.spyOn(Actions, "redirectTo");
        // @ts-ignore
        redirectTo.mockImplementation(() => true);

        //  Set the session expiry to be now
        await renderTestEnvironment({role: "STUDENT", sessionExpires: new Date(NOW).toUTCString()});

        //  Navigate to My Account (any page will do)
        await navigateToMyAccount();

        // Act
        //  Wait for the user consistency check to notice
        await new Promise((r) => setTimeout(r, 1500));

        // Assert
        //  Check we were redirected to the login page. Ideally we'd check the page itself, but this is the best we can
        //  do for the reasons described above.
        expect(redirectTo).toHaveBeenLastCalledWith("/error_expired");

        // Teardown
        // @ts-ignore
        redirectTo.mockRestore();
    });

    it('should not redirect when session expiry has not passed', async () => {
        // Arrange
        jest.spyOn(Actions, "redirectTo");
        // @ts-ignore
        redirectTo.mockImplementation(() => true);

        //  Set the session expiry to in the future
        await renderTestEnvironment({role: "STUDENT", sessionExpires: new Date(SOME_FIXED_FUTURE_DATE).toUTCString()});

        //  Navigate to My Account (any page will do)
        await navigateToMyAccount();

        // Act
        //  Wait for the user consistency check to notice, if it's going to
        await new Promise((r) => setTimeout(r, 1500));

        // Assert
        //  We should still be where we were.
        expect(window.location.pathname).toEqual("/account");
        expect(redirectTo).not.toHaveBeenLastCalledWith("/error_expired");
    });
});

import { http, HttpHandler, HttpResponse } from "msw";
import { expectH1, expectH2, renderTestEnvironment, SearchString, setUrl } from "../testUtils";
import { API_PATH, isPhy } from "../../app/services";
import { mockUser } from "../../mocks/data";
import { screen, within } from "@testing-library/react";
import { errorResponses } from "../test-factory";
import userEvent from "@testing-library/user-event";

describe("Microsoft SSO Authentication", () => {
    if (!isPhy) {
        return it('does not apply', () => {});
    }

    const renderProviderCallback = async (endpoint: HttpHandler, search?: SearchString) => {
        renderTestEnvironment({ extraEndpoints: [endpoint], role: "ANONYMOUS" });
        await setUrl({ pathname: '/auth/microsoft/callback', search });
    };

    const testContactLinkPresent = (message: RegExp) => {
        it('shows a link to the contact form', async () => {
            expect(authenticationError.element).toHaveTextContent(message);
            await userEvent.click(authenticationError.contactUsLink);
            expectH1('Contact us');
        });
    };

    describe('when the token from the provider belongs to a valid user', () => {
        it('signs them in', async () => {
            await renderProviderCallback(microsoftSignInSuccess);
            expect(dashboard.welcomeText).toHaveTextContent('Welcome back, T. Admin!');
        });
    });

    describe('on a generic error', () => {
        beforeEach(async () => await renderProviderCallback(microsoftSignInFailure));

        it('shows a toast message', async () => {    
            expect(toast().children).toHaveLength(1);
        });

        it('shows the error and the generic error page', async () => {
            expect(authenticationError.element).toHaveTextContent('CSRF check failed');
            expect(authenticationError.element).toHaveTextContent(/An error occurred while attempting to log in/);
            expect(authenticationError.element).toHaveTextContent(/You may want to return to the home page/);
            expect(authenticationError.element).toHaveTextContent(/check this FAQ,/);
            expect(authenticationError.element).toHaveTextContent(/or contact us if this keeps happening/);
        });

        testContactLinkPresent(/or contact us if this keeps happening/);
    });

    describe('on specific errors', () => {
        describe('account not linked', () => {
            beforeEach(async () => await renderProviderCallback(microsoftSignInUnlinked));

            it('does not show a toast message', async () => {
                expect(toast().children).toHaveLength(0);
            });

            it('shows a specific error message', async () => {
                expect(authenticationError.element).toHaveTextContent("You don't use this Microsoft account to log in");
                expect(authenticationError.element).toHaveTextContent(/not configured for signing in with this Microsoft account/);
                expect(authenticationError.element).toHaveTextContent(/either didn't configure sign-in with Microsoft, or used a different Microsoft account/);
                expect(authenticationError.element).toHaveTextContent(/try logging in using a different Microsoft account, a Google account, or a password/);
                expect(authenticationError.element).toHaveTextContent(/you can set up this Microsoft account for signing in to Isaac. Learn how./);
            });

            it('the log-in link works', async () => {
                await userEvent.click(authenticationError.logInLink);
                expectH2('Log in or sign up');
            });

            it('shows a link to the SSO help page', async () => {
                expect(authenticationError.ssoLink).toHaveProperty('href', 'http://localhost/pages/single_sign_on');
            });

            testContactLinkPresent(/If you need more help signing in, contact us./);
        });

        describe('consent missing', () => {
            beforeEach(async () => {
                const queryFromProvider = `?error=access_denied&error_subcode=cancel${
                    "&error_description=AADSTS65004%3a+User+declined+to+consent+to+access+the+app."}`;
                await renderProviderCallback(microsoftSignInDeniedAccess, queryFromProvider);
            });
            
            it('does not show a toast message', async () => {
                expect(toast().children).toHaveLength(0);
            });

            it('shows a specific error message', async () => {
                expect(authenticationError.element).toHaveTextContent("We need your consent");
            });

            it('shows a link to the SSO help page', async () => {
                expect(authenticationError.ssoLink).toHaveProperty('href', 'http://localhost/pages/single_sign_on');
            });

            testContactLinkPresent(/If you need more help signing in, contact us./);
        });
    });
});

const microsoftSignInSuccess = http.get(API_PATH + "/auth/microsoft/callback",
    () => HttpResponse.json(mockUser, { status: 200, })
);

const microsoftSignInFailure = http.get(API_PATH + "/auth/microsoft/callback",
    () => HttpResponse.json(errorResponses.csrfError401, { status: 403 })
);

const microsoftSignInUnlinked = http.get(API_PATH + "/auth/microsoft/callback",
    () => HttpResponse.json(errorResponses.accountNotLinked403, { status: 403})
);

const microsoftSignInDeniedAccess = http.get(API_PATH + "/auth/microsoft/callback", 
    () => HttpResponse.json(errorResponses.deniedAccess401, { status: 401 })
);

const toast = () => screen.getByTestId('toasts');

const dashboard = {
    get welcomeText() {
        const element = screen.getByRole('region', { name: 'Dashboard' });
        return within(element).getByRole('heading', { level: 3 });
    }
};

const authenticationError = {
    get logInLink() {
        return within(this.element).getByRole('link', { name: 'Log in link'});
    },

    get ssoLink() {
        return within(this.element).getByRole('link', { name: 'Link to Single Sign-On documentation'});
    },

    get contactUsLink() {
        return within(this.element).getByRole('link', { name: 'Link to contact form'});
    },

    get element() {
        return screen.getByRole('region', { name: 'Authentication Error' });
    }
};

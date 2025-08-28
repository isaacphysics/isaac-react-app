import { http, HttpHandler, HttpResponse } from "msw";
import { expectH2, renderTestEnvironment, setUrl } from "../testUtils";
import { API_PATH, isPhy } from "../../app/services";
import { mockUser } from "../../mocks/data";
import { screen, within } from "@testing-library/react";
import { errorResponses } from "../test-factory";
import userEvent from "@testing-library/user-event";

describe("Microsoft SSO Authentication", () => {
    if (!isPhy) {
        return it('does not apply', () => {});
    }

    const renderProviderCallback = async (endpoint: HttpHandler) => {
        renderTestEnvironment({ extraEndpoints: [endpoint], role: "ANONYMOUS" });
        await setUrl({ pathname: '/auth/microsoft/callback' });
            
    };

    describe('when the token from the provider belongs to a valid user', () => {
        it('signs them in', async () => {
            await renderProviderCallback(microsoftSignInSuccess);
            expect(dashboard.welcomeText).toHaveTextContent('Welcome back, T. Admin!');
        });
    });

    describe('on a generic error', () => {
        it('shows a toast message', async () => {
            await renderProviderCallback(microsoftSignInFailure);
            expect(toast().children).toHaveLength(1);
        });

        it('shows the error and the generic error page', async () => {
            await renderProviderCallback(microsoftSignInFailure);
            expect(authenticationError.heading).toHaveTextContent('CSRF check failed');
            expect(authenticationError.body).toHaveTextContent(/An error occurred while attempting to log in/);
            expect(authenticationError.body).toHaveTextContent(/You may want to return to the home page/);
        });
    });

    describe('on specific errors', () => {
        describe('account not linked', () => {
            it('does not show a toast message', async () => {
                await renderProviderCallback(microsoftSignInUnlinked);
                expect(toast().children).toHaveLength(0);
            });

            it('shows a specific error message', async () => {
                await renderProviderCallback(microsoftSignInUnlinked);
                expect(authenticationError.heading).toHaveTextContent("You don't use microsoft to log in");
                expect(authenticationError.body).toHaveTextContent(/not configured for signing in with microsoft/);
                expect(authenticationError.list).toHaveTextContent(/try logging in using a Google account/);
            });

            it('the log-in link works', async () => {
                await renderProviderCallback(microsoftSignInUnlinked);
                await userEvent.click(authenticationError.logInLink);
                expectH2('Log in or sign up');
            });

            it('shows a link to the SSO help page', async () => {
                await renderProviderCallback(microsoftSignInUnlinked);
                expect(authenticationError.ssoLink).toHaveProperty('href', 'http://localhost/pages/single_sign_on');
            });

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

const toast = () => screen.getByTestId('toasts');

const dashboard = {
    get welcomeText() {
        const element = screen.getByRole('region', { name: 'Dashboard' });
        return within(element).getByRole('heading', { level: 3 });
    }
};

const authenticationError = {
    get heading() {
        return within(this.element).getByRole('heading', { level: 3 });
    },

    get body() {
        return within(this.element).getByRole('paragraph');
    },

    get list() {
        return within(this.element).getByRole('list');
    },

    get logInLink() {
        return within(this.element).getByRole('link', { name: 'Log in link'});
    },

    get ssoLink() {
        return within(this.element).getByRole('link', { name: 'Link to SSO documentation'});
    },

    get element() {
        return screen.getByRole('region', { name: 'Authentication Error' });
    }
};

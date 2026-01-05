import { http, HttpHandler, HttpResponse } from "msw";
import { expectH1, renderTestEnvironment, SearchString, setUrl } from "../testUtils";
import { API_PATH, isPhy } from "../../app/services";
import { mockUser } from "../../mocks/data";
import { screen, waitFor, within } from "@testing-library/react";
import { errorResponses } from "../test-factory";
import userEvent from "@testing-library/user-event";

describe("Microsoft SSO Authentication", () => {
    if (!isPhy) {
        return it('does not apply', () => {});
    }

    const renderProviderCallback = async (endpoint: HttpHandler, search?: SearchString) => {
        await renderTestEnvironment({ extraEndpoints: [endpoint], role: "ANONYMOUS" });
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
                expect(authenticationError.element).toHaveTextContent(dedent`
                    We've found an Isaac account with the email address from this Microsoft account. However, the Isaac
                    account isn't configured to allow access to this Microsoft account. You've either not enabled
                    sign-in with Microsoft on your Isaac account, or you used a different Microsoft account to log in.`
                );
                expect(authenticationError.element).toHaveTextContent(dedent`
                    If you've not yet enabled sign-in with Microsoft, first log in with another method (e.g. email and
                    password). Then, on My Account, next to "Microsoft", click "Link". Read more about signing in with
                    Microsoft.`
                );
                expect(authenticationError.element).toHaveTextContent(dedent`
                    If you'd like to switch which Microsoft account you log in with, follow the same instructions, but
                    on the My Account page, click "Unlink" on any old Microsoft account first.`
                );
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

describe("Google SSO Authentication", () => {
    if (!isPhy) {
        return it('does not apply', () => {});
    }

    const renderProviderCallback = async (endpoint: HttpHandler, search?: SearchString) => {
        await renderTestEnvironment({ extraEndpoints: [endpoint], role: "ANONYMOUS" });
        await setUrl({ pathname: '/auth/google/callback', search });
    };

    describe('on specific errors', () => {
        describe('account not linked', () => {
            beforeEach(async () => await renderProviderCallback(googleSignInUnlinked));
            
            it('shows a specific error message', async () => {
                await waitFor(async () => {
                    expect(authenticationError.element).toHaveTextContent("You don't use this Google account to log in");
                    expect(authenticationError.element).toHaveTextContent(dedent`
                        We've found an Isaac account with the email address from this Google account. However, the Isaac
                        account isn't configured to allow access to this Google account. You've either not enabled
                        sign-in with Google on your Isaac account, or you used a different Google account to log in.`
                    );
                    expect(authenticationError.element).toHaveTextContent(dedent`
                        If you've not yet enabled sign-in with Google, first log in with another method (e.g. email and
                        password). Then, on My Account, next to "Google", click "Link". Read more about signing in with
                        Google.`
                    );
                    expect(authenticationError.element).toHaveTextContent(dedent`
                        If you'd like to switch which Google account you log in with, follow the same instructions, but
                        on the My Account page, click "Unlink" on any old Google account first.`
                    );
                });
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

const googleSignInUnlinked = http.get(API_PATH + "/auth/google/callback",
    () => {
        console.log("Mocking Google SSO unlinked account response");
        return HttpResponse.json(errorResponses.accountNotLinked403, { status: 403});
    }
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

const dedent = (s: TemplateStringsArray) => s
    .join('')
    .replace(/\s+/g, ' ')
    .trim();

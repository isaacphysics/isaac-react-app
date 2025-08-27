import { http, HttpResponse } from "msw";
import { renderTestEnvironment, setUrl } from "../testUtils";
import { API_PATH, isPhy } from "../../app/services";
import { mockUser } from "../../mocks/data";
import { screen, within } from "@testing-library/react";
import { errorResponses } from "../test-factory";

describe("Microsoft SSO Authentication", () => {
    if (!isPhy) {
        return it('does not apply', () => {});
    }

    describe('when the token from the provider belongs to a valid user', () => {
        it('signs them in', async () => {
            renderTestEnvironment({ extraEndpoints: successfulSignIn });
            await setUrl({ pathname: '/auth/microsoft/callback', search:'code=valid&state=valid'});
            expect(dashboard.welcomeText).toHaveTextContent('Welcome back, T. Admin!');
        });
    });

    describe('when Isaac rejects the token', () => {
        it('shows an error', async () => {
            renderTestEnvironment({ extraEndpoints: successfulSignIn });
            await setUrl({ pathname: '/auth/microsoft/callback', search:'code=invalid&state=invalid'});
            expect(authenticationError.heading).toHaveTextContent('CSRF check failed');
        });
    });
});

const successfulSignIn = [http.get(API_PATH + "/auth/microsoft/callback", ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get('code') === 'valid' && url.searchParams.get('state') === 'valid') {
        return HttpResponse.json(mockUser, { status: 200, });
    }
    return HttpResponse.json(errorResponses.csrfError401, { status: 401 });
})];

const dashboard = {
    get welcomeText() {
        const element = screen.getByRole('region', { name: 'Dashboard' });
        return within(element).getByRole('heading', { level: 3 });
    }
};

const authenticationError = {
    get heading() {
        const element = screen.getByRole('region', { name: 'Authentication Error' });
        return within(element).getByRole('heading', { level: 3 });
    }
};
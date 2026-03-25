import {screen, waitFor, within} from "@testing-library/react";
import {navigateToMyAccount, navigateToUserManager, paramsToObject, renderTestEnvironment} from "../testUtils";
import {API_PATH, isDefined} from "../../app/services";
import {http, HttpResponse} from "msw";
import {handlerThatReturns} from "../../mocks/handlers";
import {buildMockUserSummary, mockSchool, mockUser} from "../../mocks/data";
import userEvent from "@testing-library/user-event";
import {AdminSearchEndpointParams} from "../../IsaacApiTypes";

describe("AdminUserManager", () => {

    /**
     * Returns a mock user if the search is what we expect, otherwise returns an empty array - used for testing
     * that the search endpoint is being called with the right parameters
     *
     * Will return the usersToReturn if provided, otherwise will return [mockUser].map(buildMockUserSummary).
     */
    const buildSearchHandler = (adminSearchParams: AdminSearchEndpointParams, {usersToReturn, defaultUsersToReturn}: {usersToReturn?: any[], defaultUsersToReturn?: any[]}) => jest.fn(({request, params, cookies}) => {
        if (Object.entries(adminSearchParams).length === 0) return HttpResponse.json(usersToReturn
            ? usersToReturn.map(u => buildMockUserSummary(u, true))
            : [buildMockUserSummary(mockUser, true)],
        );
        const url = new URL(request.url);
        const searchParams = paramsToObject(url.searchParams);
        // If default params, return an empty array or defaultUsersToReturn
        if (!isDefined(params.postcodeRadius) && (Object.entries(searchParams).length === 1 && searchParams["postcodeRadius"] === "FIVE_MILES")) {
            return HttpResponse.json(defaultUsersToReturn
                ? defaultUsersToReturn.map(u => buildMockUserSummary(u, true))
                : []
            );
        }
        // Check that the search parameters are as expected
        const paramsAreAsExpected = Object.entries(adminSearchParams).every(([key, value]) => searchParams[key] === value);
        if (paramsAreAsExpected) {
            return HttpResponse.json(usersToReturn
                ? usersToReturn.map(u => buildMockUserSummary(u, true))
                : [buildMockUserSummary(mockUser, true)]
            );
        }
        return HttpResponse.json([]);
    });

    /**
     * Search for users with the given parameters, and check the results are as expected using the given arguments.
     *
     * DOES NOT RESET THE searchHandler MOCK - if you want to make sure the search handler is called once per search,
     * you'll need to do that yourself.
     *
     * The names that you use this function with (and those that you pass in as expectNames) should be suitably unique
     * so that they will only match the users that you expect to be returned by the search.
     *
     * Returns the search results table element.
     */
    const searchWithParams = async (params: AdminSearchEndpointParams, {expectNumberOfResults, searchHandler, expectNames, debug}: {expectNumberOfResults?: number, expectNames?: string[], searchHandler?: jest.Mock, debug?: boolean}): Promise<HTMLElement> => {
        if (isDefined(debug)) {
            console.log("searchWithParams called with params", params);
        }
        // Fill in params based on the arguments
        if (isDefined(params["email"])) {
            const emailInput = await screen.findByLabelText<HTMLInputElement>("Find a user by email:");
            await userEvent.type(emailInput, params.email);
        }
        if (isDefined(params["familyName"])) {
            const familyNameInput = await screen.findByLabelText<HTMLInputElement>("Find a user by family name:");
            await userEvent.type(familyNameInput, params.familyName);
        }
        if (isDefined(params["role"])) {
            const roleInput = await screen.findByLabelText<HTMLInputElement>("Find by user role:");
            await userEvent.selectOptions(roleInput, params.role);
        }
        if (isDefined(params["schoolOther"])) {
            const schoolInput = await screen.findByLabelText<HTMLInputElement>("Find by manually entered school:");
            await userEvent.type(schoolInput, params.schoolOther);
        }
        if (isDefined(params["postcode"])) {
            const postcodeInput = await screen.findByLabelText<HTMLInputElement>("Find users with school within a given distance of postcode:");
            await userEvent.type(postcodeInput, params.postcode);
        }
        if (isDefined(params["postcodeRadius"])) {
            const radiusInput = await screen.findByTestId<HTMLInputElement>("postcode-radius-search");
            await userEvent.selectOptions(radiusInput, params.postcodeRadius);
        }
        if (isDefined(params["schoolURN"])) {
            const urnInput = await screen.findByLabelText<HTMLInputElement>("Find a user with school URN:");
            await userEvent.type(urnInput, params.schoolURN);
        }
        // Then initiate a search
        const searchButton = await screen.findByRole("button", {name: "Search"});
        await userEvent.click(searchButton);
        const searchResultsTable = await waitFor(() => {
            const searchResultsTable = screen.getByTestId("user-search-results-table");
            expect(searchResultsTable).toBeInTheDocument();
            return searchResultsTable;
        }, {onTimeout: (error) => {
            if (isDefined(debug)) {
                screen.debug(undefined, 200000);
            }
            return error;
        }
        });
        if (isDefined(debug)) {
            screen.debug(searchResultsTable);
        }
        // Check the search handler was called, and the results are as expected (if arguments specified)
        if (isDefined(searchHandler)) {
            expect(searchHandler).toHaveBeenCalledTimes(1);
        }
        if (isDefined(expectNumberOfResults)) {
            if (expectNumberOfResults === 0) {
                const noResultsFeedback = await within(searchResultsTable).findByText("No results found");
                expect(noResultsFeedback).toBeInTheDocument();
            }
            await waitFor(() => {
                const rows = within(searchResultsTable).queryAllByTestId("user-search-result-row");
                expect(rows).toHaveLength(expectNumberOfResults);
            });
        }
        if (isDefined(expectNames)) {
            for (const name of expectNames) {
                expect(within(searchResultsTable).getByText(name)).toBeInTheDocument();
            }
        }
        return searchResultsTable;
    };

    it("shows no list of users initially", async () => {
        const searchHandler = handlerThatReturns({data: [buildMockUserSummary(mockUser, true)]});
        await renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                http.get(API_PATH + "/admin/users", searchHandler),
            ]
        });
        await navigateToUserManager();
        const tableExists = await screen.findAllByTestId("user-search-results-table")
            .then(() => true)
            .catch(() => false);
        expect(tableExists).toBe(false);
        expect(searchHandler).toHaveBeenCalledTimes(0);
    });

    it("shows no table if no filters are set", async () => {
        const searchHandler = handlerThatReturns({data: [buildMockUserSummary(mockUser, true)]});
        await renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                http.get(API_PATH + "/admin/users", searchHandler),
            ]
        });
        await navigateToUserManager();
        await expect(searchWithParams({},{searchHandler}))
            .rejects
            .toThrow();
    });

    it("shows no list of users after searching, leaving, and coming back.", async () => {
        const searchHandler = buildSearchHandler(
            {postcodeRadius: 'FIVE_MILES'},
            {
                usersToReturn: [mockUser],
            }
        );
        await renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                http.get(API_PATH + "/admin/users", searchHandler),
            ]
        });
        await navigateToUserManager();
        await searchWithParams({role: mockUser.role}, {expectNumberOfResults: 1, searchHandler});
        // Navigate away from the page
        await navigateToMyAccount();
        // Go back to the admin user manager page
        await navigateToUserManager();
        // The table should no longer be there, and the search endpoint should not have been accessed again
        const tableExists = await screen.findAllByTestId("user-search-results-table")
            .then(() => true)
            .catch(() => false);
        expect(tableExists).toBe(false);
        expect(searchHandler).toHaveBeenCalledTimes(1);
    });

    it("allows the user to filter the search by name", async () => {
        const searchHandler = buildSearchHandler(
            {familyName: mockUser.familyName},
            {
                usersToReturn: [mockUser],
                defaultUsersToReturn: [mockUser, {...mockUser, id: mockUser.id + 1, familyName: "Smith"}]
            }
        );
        await renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                http.get(API_PATH + "/admin/users", searchHandler),
            ]
        });
        await navigateToUserManager();
        await searchWithParams(
            {familyName: mockUser.familyName},
            {expectNumberOfResults: 1, searchHandler, expectNames: [`${mockUser.familyName}, ${mockUser.givenName}`]}
        );
    });

    it("allows the user to filter the search by role and school urn", async () => {
        const searchHandler = buildSearchHandler(
            {role: mockUser.role, schoolURN: mockSchool.urn},
            {defaultUsersToReturn: []}
        );
        await renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                http.get(API_PATH + "/admin/users", searchHandler),
            ]
        });
        await navigateToUserManager();
        await searchWithParams(
            {role: mockUser.role, schoolURN: mockSchool.urn},
            {
                expectNumberOfResults: 1,
                searchHandler,
                expectNames: [`${mockUser.familyName}, ${mockUser.givenName}`]
            }
        );
    });

    it("allows the user to delete a user from the list", async () => {
        const searchHandler = buildSearchHandler(
            {},
            {usersToReturn: [mockUser]}
        );
        const deleteHandler = handlerThatReturns();
        await renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                http.get(API_PATH + "/admin/users", searchHandler),
                http.delete(API_PATH + "/admin/users/:userId", deleteHandler)
            ]
        });
        await navigateToUserManager();
        const searchResultsTable = await searchWithParams(
            {role: mockUser.role},
            {
                expectNumberOfResults: 1,
                searchHandler
            }
        );
        const deleteButton = await within(searchResultsTable).findByRole("button", {name: "Delete"});
        await userEvent.click(deleteButton);
        // Ensure the delete handler was called and that the table no longer contains the deleted user
        await waitFor(async () => {
            expect(deleteHandler).toHaveBeenCalledTimes(1);
            await expect(deleteHandler).toHaveBeenRequestedWith(async (req) => {
                return req.params.userId === mockUser.id.toString();
            });
            const rows = within(screen.getByTestId("user-search-results-table")).queryAllByTestId("user-search-result-row");
            expect(rows).toHaveLength(0);
        });
    });

    it("allows the user to change the role of multiple users", async () => {
        const searchHandler = buildSearchHandler(
            {},
            {
                usersToReturn: [
                    mockUser,
                    {...mockUser, id: mockUser.id + 1, familyName: "Smith"},
                    {...mockUser, id: mockUser.id + 2, familyName: "Jones"}
                ]
            }
        );
        const roleChangeHandler = handlerThatReturns();
        await renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                http.get(API_PATH + "/admin/users", searchHandler),
                http.post(API_PATH + `/admin/users/change_role/:role`, roleChangeHandler)
            ]
        });
        await navigateToUserManager();
        const searchResultsTable = await searchWithParams(
            {role: mockUser.role},
            {
                expectNumberOfResults: 3,
                searchHandler
            }
        );
        // Check the select box in the last two rows
        const rows = within(searchResultsTable).queryAllByTestId("user-search-result-row");
        for (const row of rows.slice(1)) {
            const checkbox = await within(row).findByRole("checkbox");
            await userEvent.click(checkbox);
        }
        // Ensure the screen shows how many users are selected
        const selectedCount = await screen.findByTestId("user-search-numbers");
        expect(selectedCount).toHaveTextContent("Manage users (3)");
        expect(selectedCount).toHaveTextContent("Selected (2)");
        // Modify roles of selected users to teacher
        const roleSelect = await screen.findByRole("button", {name: "Modify Role"});
        await userEvent.click(roleSelect);
        const teacherOption = await screen.findByRole("menuitem", {name: "TEACHER"});
        await userEvent.click(teacherOption);
        // Ensure the role change handler was called and that the roles of the users have changed
        // (only the first row should be admin still)
        await waitFor(async () => {
            expect(roleChangeHandler).toHaveBeenCalledTimes(1);
            await expect(roleChangeHandler).toHaveBeenRequestedWith(async (req) => {
                return req.params.role === "TEACHER";
            });
            const rows = within(searchResultsTable).queryAllByTestId("user-search-result-row");
            expect(rows[0]).toHaveTextContent("ADMIN");
            expect(rows[1]).toHaveTextContent("TEACHER");
            expect(rows[2]).toHaveTextContent("TEACHER");
        });
    });

    it("allows the user to change the email verification status of multiple users", async () => {
        const searchHandler = buildSearchHandler(
            {},
            {
                usersToReturn: [
                    mockUser,
                    {...mockUser, id: mockUser.id + 1, familyName: "Smith"},
                    {...mockUser, id: mockUser.id + 2, familyName: "Jones"}
                ]
            }
        );
        const statusChangeHandler = handlerThatReturns();
        await renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                http.get(API_PATH + "/admin/users", searchHandler),
                http.post(API_PATH + "/admin/users/change_email_verification_status/:status/true", statusChangeHandler)
            ]
        });
        await navigateToUserManager();
        const searchResultsTable = await searchWithParams(
            {role: mockUser.role},
            {
                expectNumberOfResults: 3,
                searchHandler
            }
        );
        // Check the select box in the first two rows
        const rows = within(searchResultsTable).queryAllByTestId("user-search-result-row");
        for (const row of rows.slice(0, 2)) {
            const checkbox = await within(row).findByRole("checkbox");
            await userEvent.click(checkbox);
        }
        // Ensure the screen shows how many users are selected
        const selectedCount = await screen.findByTestId("user-search-numbers");
        expect(selectedCount).toHaveTextContent("Manage users (3)");
        expect(selectedCount).toHaveTextContent("Selected (2)");
        // Modify email verification status of selected users to not verified
        const roleSelect = await screen.findByRole("button", {name: "Email Status"});
        await userEvent.click(roleSelect);
        const statusOption = await screen.findByRole("menuitem", {name: "NOT_VERIFIED"});
        await userEvent.click(statusOption);
        // Ensure the status change handler was called and that the status of the users have changed
        // (only the last row should be "verified" still)
        await waitFor(async () => {
            expect(statusChangeHandler).toHaveBeenCalledTimes(1);
            await expect(statusChangeHandler).toHaveBeenRequestedWith(async (req) => {
                return req.params.status === "NOT_VERIFIED";
            });
            const rows = within(searchResultsTable).queryAllByTestId("user-search-result-row");
            expect(rows[0]).toHaveTextContent("NOT_VERIFIED");
            expect(within(rows[0]).queryByRole("button", {name: "Reset password"})).not.toBeDisabled();
            expect(rows[1]).toHaveTextContent("NOT_VERIFIED");
            expect(within(rows[1]).queryByRole("button", {name: "Reset password"})).not.toBeDisabled();
            expect(rows[2]).toHaveTextContent("VERIFIED");
            expect(within(rows[2]).queryByRole("button", {name: "Reset password"})).not.toBeDisabled();
        });
        statusChangeHandler.mockClear();
        // Expect the selection to be reset
        expect(screen.getByTestId("user-search-numbers")).toHaveTextContent("Selected (0)");
        // Now check that changing the status to "delivery failed" disables the reset password button
        await userEvent.click(within(rows[0]).getByRole("checkbox"));
        await userEvent.click(screen.getByRole("button", {name: "Email Status"}));
        await userEvent.click(screen.getByRole("menuitem", {name: "DELIVERY_FAILED"}));
        await waitFor(async () => {
            expect(statusChangeHandler).toHaveBeenCalledTimes(1);
            await expect(statusChangeHandler).toHaveBeenRequestedWith(async (req) => {
                return req.params.status === "DELIVERY_FAILED";
            });
            expect(rows[0]).toHaveTextContent("DELIVERY_FAILED");
            expect(within(rows[0]).queryByRole("button", {name: "Reset password"})).toBeDisabled();
        });
    });

    it("allows you to request a password reset for a user", async () => {
        const searchHandler = buildSearchHandler(
            {},
            {
                usersToReturn: [mockUser]
            }
        );
        const resetPasswordHandler = handlerThatReturns();
        await renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                http.get(API_PATH + "/admin/users", searchHandler),
                http.post(API_PATH + "/users/resetpassword", resetPasswordHandler)
            ]
        });
        await navigateToUserManager();
        const searchResultsTable = await searchWithParams(
            {role: mockUser.role},
            {
                expectNumberOfResults: 1,
                searchHandler
            }
        );
        const resetPasswordButton = await within(searchResultsTable).findByRole("button", {name: "Reset password"});
        await userEvent.click(resetPasswordButton);
        await waitFor(async () => {
            expect(resetPasswordHandler).toHaveBeenCalledTimes(1);
            await expect(resetPasswordHandler).toHaveBeenRequestedWith(async ({request}) => {
                const { email } = await request.json().then(data => data as Record<string, string>);;
                return email === mockUser.email;
            });
        });
    });
});

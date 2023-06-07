import {screen, waitFor, within} from "@testing-library/react";
import {renderTestEnvironment, followHeaderNavLink} from "../utils";
import {API_PATH, isAda, isPhy, siteSpecific} from "../../app/services";
import {rest} from "msw";
import {basicHandlerThatReturns} from "../../mocks/handlers";
import {buildMockUserSummary, mockUser} from "../../mocks/data";
import userEvent from "@testing-library/user-event";

describe("AdminUserManager", () => {

    it("shows no list of users initially", async () => {
        const searchHandler = basicHandlerThatReturns([buildMockUserSummary(mockUser, true)]);
        renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                rest.get(API_PATH + "/admin/users", searchHandler),
            ]
        });
        await followHeaderNavLink("Admin", "User Manager");
        const tableExists = await screen.findAllByTestId("user-search-results-table")
            .then(() => true)
            .catch(() => false);
        expect(tableExists).toBe(false);
        expect(searchHandler).toHaveBeenCalledTimes(0);
    });

    it("shows no list of users after searching, leaving, and coming back", async () => {
        const searchHandler = basicHandlerThatReturns([buildMockUserSummary(mockUser, true)]);
        renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                rest.get(API_PATH + "/admin/users", searchHandler),
            ]
        });
        await followHeaderNavLink("Admin", "User Manager");
        // Click the search button
        const searchButton = await screen.findByRole("button", {name: "Search"});
        await searchButton.click();
        const searchResultsTable = await screen.findByTestId("user-search-results-table");
        expect(searchResultsTable).toBeInTheDocument();
        expect(searchHandler).toHaveBeenCalledTimes(1);
        expect(within(searchResultsTable).getAllByTestId("user-search-result-row")).toHaveLength(1);
        // Navigate away from the page
        searchHandler.mockClear();
        await followHeaderNavLink("Teach", siteSpecific("Assignment Progress", "Markbook"));
        // Go back to the admin user manager page
        await followHeaderNavLink("Admin", "User Manager");
        // The table should no longer be there, and the search endpoint should not have been accessed again
        const tableExists = await screen.findAllByTestId("user-search-results-table")
            .then(() => true)
            .catch(() => false);
        expect(tableExists).toBe(false);
        expect(searchHandler).toHaveBeenCalledTimes(1);
    });

    it("allows the user to filter the search by name", async () => {
        const searchHandler = jest.fn((req, res, ctx) => {
            if (req.url.searchParams.get("familyName") === mockUser.familyName) {
                return res(ctx.json([
                    buildMockUserSummary(mockUser, true)
                ]));
            } else {
                return res(ctx.json([
                    buildMockUserSummary(mockUser, true),
                    buildMockUserSummary({...mockUser, id: mockUser.id + 1, familyName: "Smith"}, true),
                ]));
            }
        });
        renderTestEnvironment({
            role: "ADMIN",
            extraEndpoints: [
                rest.get(API_PATH + "/admin/users", searchHandler),
            ]
        });
        await followHeaderNavLink("Admin", "User Manager");
        // Click the search button
        const searchButton = await screen.findByRole("button", {name: "Search"});
        await searchButton.click();
        // Assert 2 rows in the table
        const searchResultsTable = await screen.findByTestId("user-search-results-table");
        expect(within(searchResultsTable).getAllByTestId("user-search-result-row")).toHaveLength(2);
        // Type in the user's name
        const nameInput = await screen.findByLabelText<HTMLInputElement>("Find a user by family name:");
        await userEvent.type(nameInput, mockUser.familyName);
        // Click the search button again
        await searchButton.click();
        // The search endpoint should have been called again, and the table should have one row
        await waitFor(() => {
            expect(within(searchResultsTable).getAllByTestId("user-search-result-row")).toHaveLength(1);
        });
        // Expect that row to be the one we expect
        const row = within(searchResultsTable).getByTestId("user-search-result-row");
        expect(within(row).getByText(`${mockUser.familyName}, ${mockUser.givenName}`)).toBeInTheDocument();
    });
});

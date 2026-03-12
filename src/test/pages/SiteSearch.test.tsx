import { http } from "msw";
import { API_PATH } from "../../app/services";
import { expectH1, renderTestEnvironment, setUrl } from "../testUtils";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("Site search", () => {
    const searchHandler = jest.fn();

    const renderSiteSearch = async (params?: `?${string}`) => {
        await renderTestEnvironment({
            extraEndpoints: [
                http.get(API_PATH + "/search", searchHandler),
            ]
        });
        await setUrl({pathname: "/search", search: params});
        expectH1("Search");
    };

    afterEach(() => {
        searchHandler.mockReset();
    });

    it("should display no results on load with an empty query", async () => {
        await renderSiteSearch();
        expect(screen.queryAllByTestId("list-view-item")).toHaveLength(0);
    });

    it("typing a query should trigger a search", async () => {
        await renderSiteSearch();

        await userEvent.type(
            within(screen.getByRole("main")).getByRole("searchbox"),
            "energy"
        );
        fireEvent.submit(within(screen.getByRole("main")).getByTestId("search-form"));

        await waitFor(() => {
            expect(searchHandler).toHaveBeenCalledTimes(1);
            expect(searchHandler).toHaveBeenRequestedWith(async (req) => {
                return req.request.url.includes("query=energy");
            });
        });
    });

    it.skip("changing filters should trigger a search", async () => {
        await renderSiteSearch();

        // TODO how do you interact with styled-select in a test?
        await userEvent.selectOptions(
            within(screen.getByRole("main")).getAllByRole("combobox")[0],
            "Concepts"
        );
        fireEvent.submit(within(screen.getByRole("main")).getByTestId("search-form"));

        await waitFor(() => {
            expect(searchHandler).toHaveBeenCalledTimes(1);
            expect(searchHandler).toHaveBeenRequestedWith(async (req) => {
                return req.request.url.includes("types=isaacConceptPage");
            });
        });
    });

    it("loading a URL with query parameters should trigger a search", async () => {
        await renderSiteSearch("?query=energy&types=isaacQuestionPage,isaacConceptPage");

        await waitFor(() => {
            expect(searchHandler).toHaveBeenCalledTimes(1);
            expect(searchHandler).toHaveBeenRequestedWith(async (req) => {
                return req.request.url.includes("query=energy") && req.request.url.includes("types=isaacQuestionPage%2CisaacConceptPage");
            });
        });
    });
});

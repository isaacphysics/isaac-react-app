import { HttpHandler } from "msw";
import { isAda } from "../../app/services"
import { navigateToSetManageWork, renderTestEnvironment, waitForLoaded } from "../testUtils";
import { screen } from "@testing-library/dom";


describe("Set / Manage work", () => {
    if (isAda) {
        it('is hidden on Ada', () => {});
        return;
    }

    const renderSetManageWork = async ({endpoints = []}: { endpoints?: HttpHandler[], path?: string } = {}) => {
        await renderTestEnvironment({
            extraEndpoints: [
                ...endpoints
            ]
        });
        await navigateToSetManageWork();
        await waitForLoaded();
    };

    it("Shows assignments by month", async () => {
        await renderSetManageWork();
        
        expect(await screen.findByTestId("timeline")).toContain("May");
    });
});

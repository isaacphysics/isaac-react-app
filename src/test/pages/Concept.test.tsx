import { within, screen } from "@testing-library/dom";
import { API_PATH, siteSpecific } from "../../app/services";
import { renderTestEnvironment, setUrl } from "../testUtils";
import { mockConceptPage } from "../../mocks/data";
import { expectAdaBreadCrumbs } from "../helpers/quiz";
import { http, HttpResponse } from "msw";

describe("Concept", () => {
    it('renders the concept title from the mock concept page', async () => {
        await renderTestEnvironment();
        await setUrl({ pathname: "/concepts/_mock_concept_page_" });
        expect(await conceptPage.header()).toHaveTextContent(mockConceptPage.title);        
    });

    describe("with the 11-14 topic", () => {
        it('does not show an error', async () => {
            await renderTestEnvironment({extraEndpoints: [
                http.get(API_PATH + "/pages/topics/11_14", () => HttpResponse.json({ error: 'Not Found' }, { status: 404 }))
            ]});
            await setUrl({ pathname: "/concepts/_mock_concept_page_?topic=11_14"});
            expect(conceptPage.toasts()).toHaveLength(0);
        });

        it("it shows 11-14 Topics among the breadcrumbs", async () => {
            await renderTestEnvironment();
            await setUrl({ pathname: "/concepts/_mock_concept_page_?topic=11_14"});
            expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/topics#11-14", text: "11-14 Topics"}, mockConceptPage.title]);
        });
    });
});

const conceptPage = {
    async header(): Promise<HTMLElement> {
        return within(await screen.findByTestId('main')).findByRole('heading', { level: siteSpecific(3, 1) });
    },

    toasts(): NodeListOf<ChildNode> {
        return screen.getByTestId('toasts').childNodes;
    }
};

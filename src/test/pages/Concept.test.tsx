import { within, screen } from "@testing-library/dom";
import { API_PATH, isAda, isPhy, siteSpecific } from "../../app/services";
import { renderTestEnvironment, setUrl } from "../testUtils";
import { mockConceptPage } from "../../mocks/data";
import { expectAdaBreadCrumbs } from "../helpers/quiz";
import { http, HttpResponse } from "msw";
import { IsaacConceptPageDTO } from "../../IsaacApiTypes";
import { buildFunctionHandler } from "../../mocks/handlers";

describe("Concept", () => {
    it('renders the concept title from the mock concept page', async () => {
        await renderTestEnvironment({extraEndpoints: isPhy ? [ buildFunctionHandler("/bookmarks", [], () => []) ] : []});
        await setUrl({ pathname: "/concepts/_mock_concept_page_" });
        expect(await conceptPage.header()).toHaveTextContent(mockConceptPage.title);        
    });

    if (isAda) {
        describe("with the 11-14 topic", () => {
            it('does not show an error', async () => {
                await renderTestEnvironment({extraEndpoints: [
                    http.get(API_PATH + "/pages/topics/11_14", () => HttpResponse.json({ error: 'Not Found' }, { status: 404 }))
                ]});
                await setUrl({ pathname: "/concepts/_mock_concept_page_?topic=11_14"});
                expect(conceptPage.toasts()).toHaveLength(0);
            });

            it("shows 11-14 Topics among the breadcrumbs", async () => {
                await renderTestEnvironment();
                await setUrl({ pathname: "/concepts/_mock_concept_page_?topic=11_14"});
                expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/topics#11-14", text: "11-14 Topics"}, mockConceptPage.title]);
            });

            describe('Next button', () => {
                it("shows on a known page", async () => {
                    await renderTestEnvironment({ extraEndpoints: [
                        buildFunctionHandler("/pages/concepts/social_engineering", [], () => socialEngineeringPage)
                    ]});
                    await setUrl({ pathname: "/concepts/social_engineering?topic=11_14"});
                    expect(conceptPage.navigateNext()).toHaveTextContent("Malware");
                    expect(conceptPage.navigateNext()).toHaveAttribute("href", "/concepts/tf-malware-hackers?topic=11_14");
                });

                it("is hidden from an unknown page", async () => {
                    await renderTestEnvironment();
                    await setUrl({ pathname: "/concepts/_mock_concept_page_?topic=11_14"});
                    expect(conceptPage.navigateNext()).toBe(null);
                });
            });

            it("shows a link to the 11-14 topics page", async () => {
                await renderTestEnvironment();
                await setUrl({ pathname: "/concepts/_mock_concept_page_?topic=11_14"});
                expect(await conceptPage.navigateHome()).toHaveTextContent("11-14 Topics");
                expect(await conceptPage.navigateHome()).toHaveAttribute("href", "/topics#11-14");
            });
        });
    }
});

const conceptPage = {
    async header(): Promise<HTMLElement> {
        return within(await screen.findByTestId('main')).findByRole('heading', { level: siteSpecific(3, 1) });
    },

    navigateNext(): HTMLElement | null {
        return screen.queryByRole('link', { name: /Next/i });
    },

    navigateHome(): Promise<HTMLElement> {
        return screen.findAllByRole('link', { name: /Topic.*:/i }).then(elems => elems[0]);
    },

    toasts(): NodeListOf<ChildNode> {
        return screen.getByTestId('toasts').childNodes;
    }
};

const socialEngineeringPage: IsaacConceptPageDTO = {
    type: "IsaacConceptPage",
    encoding: "markdown",
    title: "Social Engineering",
    id: 'social_engineering'
};
import { within, screen } from "@testing-library/dom";
import { API_PATH, DOCUMENT_TYPE, isAda, isPhy, siteSpecific } from "../../app/services";
import { renderTestEnvironment, setUrl } from "../testUtils";
import { mockConceptPage } from "../../mocks/data";
import { expectAdaBreadCrumbs } from "../helpers/quiz";
import { http, HttpResponse } from "msw";
import { IsaacConceptPageDTO, IsaacTopicSummaryPageDTO } from "../../IsaacApiTypes";
import { buildFunctionHandler } from "../../mocks/handlers";

describe("Concept", () => {
    it('renders the concept title from the mock concept page', async () => {
        await renderTestEnvironment({extraEndpoints: isPhy ? [ buildFunctionHandler("/bookmarks", [], () => []) ] : []});
        await setUrl({ pathname: "/concepts/_mock_concept_page_" });
        expect(await conceptPage.header()).toHaveTextContent(mockConceptPage.title);        
    });

    if (isAda) {
        describe("given known 11-14 concept", () => {
            const visitConcept = async () => {
                await renderTestEnvironment({extraEndpoints: [
                    http.get(API_PATH + "/pages/topics/11_14", () => HttpResponse.json(undefined, { status: 403 })),
                    buildFunctionHandler("/pages/concepts/social_engineering", [], () => socialEngineeringPage)
                ]});
                await setUrl({ pathname: `/concepts/social_engineering`});
            };

            it('does not show an error', async () => {
                await visitConcept();
                expect(conceptPage.toasts()).toHaveLength(0);
            });

            it("shows 11-14 Topics among the breadcrumbs", async () => {
                await visitConcept();
                expectAdaBreadCrumbs([{href: '/', text: "Home"}, {href: "/topics#11-14", text: "11-14 Topics"}], socialEngineeringPage.title);
            });

            it("shows a link to the next page", async () => {
                await visitConcept();
                expect(conceptPage.navigateNext()).toHaveTextContent("Malware");
                expect(conceptPage.navigateNext()).toHaveAttribute("href", "/concepts/tf-malware-hackers");
            });

            it("shows a link to the 11-14 topics page", async () => {
                await visitConcept();
                expect(await conceptPage.navigateHome()).toHaveTextContent("Topic: 11-14 Topics");
                expect(await conceptPage.navigateHome()).toHaveAttribute("href", "/topics#11-14");
            });
        });

        describe("given a known topic", () => {
            const visitConcept = async () => {
                await renderTestEnvironment({extraEndpoints: [
                    buildFunctionHandler("/pages/topics/hardware", [], () => hardwareTopic)
                ]});
                await setUrl({ pathname: `/concepts/_mock_concept_page_?topic=hardware`});
            };
            it('does not show an error', async () => {
                await visitConcept();
                expect(conceptPage.toasts()).toHaveLength(0);
            });

            it("shows known topic among the breadcrumbs", async () => {
                await visitConcept();
                expectAdaBreadCrumbs(
                    [{href: '/', text: "Home"}, {href: "/topics", text: "All topics"}, {href: "/topics/hardware", text: "Hardware"}],
                    mockConceptPage.title
                );
            });

            it("shows a link to the next page", async () => {
                await visitConcept();
                expect(conceptPage.navigateNext()).toHaveTextContent("Successor");
                expect(conceptPage.navigateNext()).toHaveAttribute("href", "/concepts/np?topic=hardware");
            });

            it("shows a link to the specific topic page", async () => {
                await visitConcept();
                expect(await conceptPage.navigateHome()).toHaveTextContent("Topic: Hardware");
                expect(await conceptPage.navigateHome()).toHaveAttribute("href", "/topics/hardware");
            });
        });

        describe("given an unknown topic", () => {
            const visitConcept = async () => {
                await renderTestEnvironment({extraEndpoints: [
                    http.get(API_PATH + "/pages/topics/unknown", () => HttpResponse.json(undefined, { status: 403 })),
                ]});
                await setUrl({ pathname: `/concepts/_mock_concept_page_?topic=unknown`});
            };

            it('shows an error', async () => {
                await visitConcept();
                expect(conceptPage.toasts()).toHaveLength(1);
                expect(conceptPage.toasts()[0]).toHaveTextContent("Unable to load topic");
            });

            it("shows generic breadcrumbs", async () => {
                await visitConcept();
                expectAdaBreadCrumbs( [{href: '/', text: "Home"}, {href: "/topics", text: "All topics"}], mockConceptPage.title );
            });

            it("does not show a link to the next page", async () => {
                await visitConcept();
                expect(conceptPage.navigateNext()).toBe(null);
            });

            it("shows a generic link to the topics page", async () => {
                await visitConcept();
                expect(await conceptPage.navigateHome()).toHaveTextContent("Topic: All topics");
                expect(await conceptPage.navigateHome()).toHaveAttribute("href", "/topics");
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
    type: DOCUMENT_TYPE.CONCEPT,
    title: "Social Engineering",
    id: 'social_engineering'
};

const hardwareTopic: IsaacTopicSummaryPageDTO = {
    id: "topic_summary_hardware",
    title: "Hardware",
    relatedContent: [{ id: "_mock_concept_page_" }, { id: "np", title: "Successor", type: DOCUMENT_TYPE.CONCEPT }]
};

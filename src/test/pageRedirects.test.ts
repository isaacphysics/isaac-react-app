import { http, HttpHandler, HttpResponse } from "msw";
import { API_PATH, isAda, SITE, SITE_SUBJECT } from "../app/services";
import { expectUrl, PathString, renderTestEnvironment, setUrl } from "./testUtils";

describe('pageRedirects', () => {
    if (isAda) {
        it('no redirect tests yet for Ada', () => {});
    }

    const handlers = [
        http.get(API_PATH + "/pages/books/index/book_physics_skills_19", () => HttpResponse.json({}, { status: 200, }))
    ];

    const redirectTestCases: TestCase[]  = [
        { site: SITE.SCI, from: "/physics_skills_14", to: "/books/physics_skills_19", handlers},
        { site: SITE.SCI, from: "/book", to: "/books/physics_skills_19", handlers},
        { site: SITE.SCI, from: "/books/physics_skills_14", to: "/books/physics_skills_19", handlers},
    ] as const;

    const isCurrentSite = (tc: TestCase) => tc.site === SITE_SUBJECT;

    redirectTestCases.filter(isCurrentSite).forEach(({ from, to, handlers }) => {
        it(`redirects ${from} to ${to}`, async () => {
            await renderTestEnvironment({ extraEndpoints: handlers });
            await setUrl({ pathname: from });
            await expectUrl(to);
        });
    });
});

type TestCase = { site: SITE, from: PathString, to: PathString, handlers? : HttpHandler[]};
    
import {screen, waitFor} from "@testing-library/react";
import {renderTestEnvironment} from "../testUtils";

describe("IsaacApp", () => {

    it('should open on the home page', async () => {
        await renderTestEnvironment();
        await waitFor(() => {
            expect(window.location.pathname).toBe("/");
        });
    });

    it('should show the users number of current assignments in the navigation menu (Physics only)', async () => {
        await renderTestEnvironment();
        const myAssignmentsBadge = await screen.findByTestId("my-assignments-badge");
        expect(myAssignmentsBadge.textContent).toContain("5");
    });

    // TODO broken since we only show 3-4 news pods on the homepage
    // isAda && it('should show featured news pods before non-featured ones, and order pods correctly based on id (CS only)', async () => {
    //     await renderTestEnvironment();
    //     const transformPodList = siteSpecific((ps: any[]) => ps, (ps: any[]) => reverse(ps));
    //     const newsCarousel = await screen.findByTestId("news-pod-deck");
    //     const newsPods = await within(newsCarousel).findAllByTestId("news-pod");
    //     const newsPodLinks = newsPods.map(p => within(p).queryAllByRole("link")[0]?.getAttribute("href"));
    //     expect(newsPods).toHaveLength(4);
    //     const featuredNewsPodLinks = transformPodList(
    //         mockNewsPods.results.filter(p => p.tags.includes(FEATURED_NEWS_TAG)).map(p => p.url)
    //     );
    //     expect(newsPodLinks.slice(0, featuredNewsPodLinks.length)).toEqual(featuredNewsPodLinks);
    //     const nonFeaturedNewsPodLinks = transformPodList(
    //         mockNewsPods.results.filter(p => !p.tags.includes(FEATURED_NEWS_TAG)).map(p => p.url)
    //     );
    //     expect(newsPodLinks.slice(featuredNewsPodLinks.length)).toEqual(nonFeaturedNewsPodLinks);
    // });
});

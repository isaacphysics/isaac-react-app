import React from "react";
import { useGetBookDetailPageQuery } from "../../state/slices/api/booksApi";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";
import { ListView } from "./list-groups/ListView";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";

export const BookPage = ({ pageId }: { pageId: string }) => {
    const bookDetailPageQuery = useGetBookDetailPageQuery({ id: pageId });

    return <div className="book-page">
        <ShowLoadingQuery
            query={bookDetailPageQuery}
            defaultErrorTitle="Unable to fetch book page."
            thenRender={(page) => {
                return (
                    <>
                        <h3 className="mb-3">{page.title}</h3>

                        {!!page.gameboards?.length && <>
                            <h4 className="mb-3">Questions and resources</h4>
                            <span>Revision questions are available as an interactive question pack.</span>
                            <div className="mt-3 mb-5 list-results-container p-2">
                                <ListView
                                    items={page.gameboards.map(g => ({...g, type: "gameboard"}))}
                                    fullWidth
                                />
                            </div>
                        </>}

                        <h4 className="mb-3">Review</h4>
                        <span>Watch both introductory and tutorial videos for this topic.</span>
                        <IsaacContentValueOrChildren value={page.value} encoding={page.encoding}>
                            {page.children}
                        </IsaacContentValueOrChildren>
                        
                        {page?.relatedContent && <>
                            <h5 className="mb-3">Get a refresher of the core concepts</h5>
                            <div className="mt-3 mb-5 list-results-container p-2">
                                <ListView
                                    items={page.relatedContent}
                                    fullWidth
                                />
                            </div>
                        </>}

                        {!!page.extensionGameboards?.length && <>
                            <h5 className="mb-3">Extension work</h5>
                            <span>Expand your boundaries by having a go at these additional extension questions.</span>
                            <div className="mt-3 mb-5 list-results-container p-2">
                                <ListView
                                    items={page.extensionGameboards.map(g => ({...g, type: "gameboard"}))}
                                    fullWidth
                                />
                            </div>
                        </>}
                    </>
                );
            }}
        />
    </div>;
};

import React, {useEffect, useState} from "react";
import {Container} from "reactstrap";
import {MainContent, SidebarLayout} from "./layout/SidebarLayout";
import {Markup} from "./markup";
import {TitleAndBreadcrumb} from "./TitleAndBreadcrumb";
import {BOOK_DETAIL_ID_SEPARATOR, BOOKS_CRUMB, useContextFromContentObjectTags} from "../../services";
import {useLocation, useParams} from "react-router";
import {useGetBookDetailPageQuery, useGetBookIndexPageQuery} from "../../state/slices/api/booksApi";
import {BookPage} from "./BookPage";
import {skipToken} from "@reduxjs/toolkit/query";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {IsaacContentValueOrChildren} from "../content/IsaacContentValueOrChildren";
import {ContentDTO} from "../../../IsaacApiTypes";
import { PageMetadata } from "./PageMetadata";
import { WithFigureNumbering } from "./WithFigureNumbering";
import { ContentControlledSidebar } from "./sidebar/ContentControlledSidebar";

export const Book = () => {

    const { bookId } = useParams();
    const [pageId, setPageId] = useState<string | undefined>(undefined);

    const bookIndexPageQuery = useGetBookIndexPageQuery({id: `book_${bookId}`});
    const bookDetailPageQuery = useGetBookDetailPageQuery(pageId ? { id: pageId } : skipToken);

    const { data: book } = bookIndexPageQuery;

    const location = useLocation();

    const pageContext = useContextFromContentObjectTags(book);

    useEffect(() => {
        const section = location.pathname.split("/")[3];

        if (!book?.id || !section) {
            setPageId(undefined);
            return;
        }

        const fragmentId = book?.id + BOOK_DETAIL_ID_SEPARATOR + section;
        setPageId(fragmentId);
    }, [book?.id, location.pathname]);

    return <Container data-bs-theme={pageContext?.subject ?? "neutral"}>
        <TitleAndBreadcrumb
            currentPageTitle={pageId === undefined ? "Book" : book?.title ?? "Book"}
            icon={{type: "icon", icon: "icon-book"}}
            intermediateCrumbs={pageId !== undefined && book?.title ? [BOOKS_CRUMB, {title: book.title, to: `/books/${bookId}`}] : [BOOKS_CRUMB]}
        />
        <SidebarLayout>
            <ShowLoadingQuery
                query={bookIndexPageQuery}
                defaultErrorTitle="Unable to load book contents"
                thenRender={(definedBookIndexPage) => {
                    return <>
                        <ContentControlledSidebar sidebar={book?.sidebar} hideButton/>
                        <MainContent>
                            {pageId
                                ? <ShowLoadingQuery
                                    query={bookDetailPageQuery}
                                    defaultErrorTitle="Unable to load book page"
                                    thenRender={(bookDetailPage) => {
                                        return <WithFigureNumbering doc={bookDetailPage}>
                                            <BookPage page={bookDetailPage} />
                                        </WithFigureNumbering>;
                                    }}
                                />
                                : <>
                                    <PageMetadata doc={definedBookIndexPage} showSidebarButton sidebarButtonText={book?.sidebar?.subtitle}/>
                                    {definedBookIndexPage.value && <div>
                                        <div className="book-image-container book-height-lg d-none d-sm-block mx-3 float-end">
                                            <img src={definedBookIndexPage.coverImage?.src} alt={definedBookIndexPage.title} />
                                        </div>
                                        <Markup className="d-contents" trusted-markup-encoding={"markdown"}>{definedBookIndexPage.value}</Markup>
                                    </div>}
                                    {!!definedBookIndexPage.children?.length && <>
                                        <div className="d-flex">
                                            <div className="flex-grow-1">
                                                <WithFigureNumbering doc={definedBookIndexPage}>
                                                    <IsaacContentValueOrChildren {...definedBookIndexPage.children[0] as ContentDTO} />
                                                </WithFigureNumbering>
                                            </div>
                                            <div className="book-image-container book-height-lg d-none d-sm-block mx-3 float-end">
                                                <img src={definedBookIndexPage.coverImage?.src} alt={definedBookIndexPage.title} />
                                            </div>
                                        </div>
                                        <IsaacContentValueOrChildren>
                                            {definedBookIndexPage.children.slice(1)}
                                        </IsaacContentValueOrChildren>
                                    </>}
                                </>
                            }
                        </MainContent>
                    </>;
                }}
            />
        </SidebarLayout>
    </Container>;
};

import React, {useEffect, useState} from "react";
import {Container} from "reactstrap";
import {BookSidebar, MainContent, SidebarLayout} from "./layout/SidebarLayout";
import {Markup} from "./markup";
import {TitleAndBreadcrumb} from "./TitleAndBreadcrumb";
import {useContextFromContentObjectTags} from "../../services";
import {useHistory} from "react-router";
import {useGetBookDetailPageQuery, useGetBookIndexPageQuery} from "../../state/slices/api/booksApi";
import {BookPage} from "./BookPage";
import {skipToken} from "@reduxjs/toolkit/query";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {TeacherNotes} from "./TeacherNotes";
import {IsaacContentValueOrChildren} from "../content/IsaacContentValueOrChildren";
import {ContentDTO} from "../../../IsaacApiTypes";
import {EditContentButton} from "./EditContentButton";

interface BookProps {
    match: { params: { bookId: string } };
}

export const Book = ({match: {params: {bookId}}}: BookProps) => {

    const [pageId, setPageId] = useState<string | undefined>(undefined);

    const bookIndexPageQuery = useGetBookIndexPageQuery({id: `book_${bookId}`});
    const bookDetailPageQuery = useGetBookDetailPageQuery(pageId ? { id: pageId } : skipToken);

    const { data: book } = bookIndexPageQuery;

    const history = useHistory();

    const pageContext = useContextFromContentObjectTags(book);

    useEffect(() => {
        const section = history.location.pathname.split("/")[3];

        if (!book?.id || !section) {
            setPageId(undefined);
            return;
        }

        const fragmentId = book?.id + "_" + section;
        if (fragmentId) {
            setPageId(fragmentId);
        }
    }, [book?.chapters, history.location]);

    return <Container data-bs-theme={pageContext?.subject ?? "neutral"}>
        <TitleAndBreadcrumb
            currentPageTitle={book?.title ?? "Book"}
            icon={{type: "hex", icon: "icon-book"}}
        />
        <SidebarLayout>
            <ShowLoadingQuery
                query={bookIndexPageQuery}
                defaultErrorTitle="Unable to load book contents."
                thenRender={(definedBookIndexPage) => {
                    return <>
                        <BookSidebar book={definedBookIndexPage} urlBookId={bookId} pageId={pageId} />
                        <MainContent className="mt-4">
                            {pageId
                                ? <ShowLoadingQuery
                                    query={bookDetailPageQuery}
                                    defaultErrorTitle="Unable to load book page."
                                    thenRender={(bookDetailPage) => <BookPage page={bookDetailPage} />}
                                />
                                : <>
                                    <EditContentButton doc={definedBookIndexPage}/>
                                    <TeacherNotes notes={definedBookIndexPage.teacherNotes} />
                                    {definedBookIndexPage.value && <div>
                                        <div className="book-image-container book-height-lg d-none d-sm-block mx-3 mb-4 float-end">
                                            <img src={definedBookIndexPage.coverImage?.src} alt={definedBookIndexPage.title} />
                                        </div>
                                        <Markup className="d-contents" trusted-markup-encoding={"markdown"}>{definedBookIndexPage.value}</Markup>
                                    </div>}
                                    {definedBookIndexPage.children?.length && <>
                                        <div className="d-flex">
                                            <div className="flex-grow-1">
                                                <IsaacContentValueOrChildren {...definedBookIndexPage.children[0] as ContentDTO} />
                                            </div>
                                            <div className="book-image-container book-height-lg d-none d-sm-block mx-3 mb-4 float-end">
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

import React, { useEffect, useState } from "react";
import { Alert, Container } from "reactstrap";
import { BookSidebar, MainContent, SidebarLayout } from "./layout/SidebarLayout";
import { Markup } from "./markup";
import { TitleAndBreadcrumb } from "./TitleAndBreadcrumb";
import { isDefined, useContextFromContentObjectTags } from "../../services";
import { useHistory } from "react-router";
import { useGetBookDetailPageQuery, useGetBookIndexPageQuery } from "../../state/slices/api/booksApi";
import { ShowLoading } from "../handlers/ShowLoading";
import { BookPage } from "./BookPage";
import { skipToken } from "@reduxjs/toolkit/query";
    
interface BookProps {
    match: { params: { bookId: string } };
}

export const Book = ({match: {params: {bookId}}}: BookProps) => {

    const [pageId, setPageId] = useState<string | undefined>(undefined);
    
    const { data: book }  = useGetBookIndexPageQuery({id: `book_${bookId}`});
    const { data: bookDetailPage } = useGetBookDetailPageQuery(pageId ? { id: pageId } : skipToken);

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
            icon={{type: "hex", icon: "page-icon-book"}}
        />
        <SidebarLayout>
            <ShowLoading
                until={book ? {definedBookIndexPage: book, bookDetailPage} : undefined}
                ifNotFound={<Alert color="warning">Book contents could not be loaded, please try refreshing the page.</Alert>}
                thenRender={({definedBookIndexPage, bookDetailPage}) => {
                    return <>
                        <BookSidebar book={definedBookIndexPage} urlBookId={bookId} pageId={pageId} />
                        <MainContent className="mt-4">
                            {isDefined(bookDetailPage) 
                                ? <BookPage page={bookDetailPage} /> 
                                : <div>
                                    <div className="book-image-container mx-3 float-end">
                                        <img src={definedBookIndexPage.coverImage?.src} alt={definedBookIndexPage.title} />
                                    </div>
                                    <Markup className="d-contents" trusted-markup-encoding={"markdown"}>{definedBookIndexPage.value}</Markup>
                                </div>
                            }
                        </MainContent>
                    </>;
                }}
            />
        </SidebarLayout>
    </Container>;
};

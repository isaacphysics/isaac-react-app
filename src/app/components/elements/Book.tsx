import React, { useEffect, useState } from "react";
import { Alert, Container } from "reactstrap";
import { BookSidebar, MainContent, SidebarLayout } from "./layout/SidebarLayout";
import { Markup } from "./markup";
import { TitleAndBreadcrumb } from "./TitleAndBreadcrumb";
import { isDefined, useContextFromContentObjectTags } from "../../services";
import { useHistory } from "react-router";
import { useGetBookIndexPageQuery } from "../../state/slices/api/booksApi";
import { ShowLoading } from "../handlers/ShowLoading";
import { BookPage } from "./BookPage";
    
interface BookProps {
    match: { params: { bookId: string } };
}

export const Book = ({match: {params: {bookId}}}: BookProps) => {

    const {data: book} = useGetBookIndexPageQuery({id: `book_${bookId}`});

    const [pageId, setPageId] = useState<string | undefined>(undefined);
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
                until={book} 
                ifNotFound={<Alert color="warning">Book contents could not be loaded, please try refreshing the page.</Alert>}
                thenRender={(definedBook) => {
                    return <>
                        <BookSidebar book={definedBook} urlBookId={bookId} pageId={pageId} />
                        <MainContent className="mt-4">
                            {isDefined(pageId) 
                                ? <BookPage pageId={pageId} /> 
                                : <div>
                                    <div className="book-image-container mx-3 float-end">
                                        <img src={definedBook.coverImage?.src} alt={definedBook.title} />
                                    </div>
                                    <Markup className="d-contents" trusted-markup-encoding={"markdown"}>{definedBook.value}</Markup>
                                </div>
                            }
                        </MainContent>
                    </>;
                }}
            />
        </SidebarLayout>
    </Container>;
};

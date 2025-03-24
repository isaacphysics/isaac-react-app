import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import { IsaacBookIndexPageDTO } from "../../../IsaacApiTypes";
import { BookSidebar, MainContent, SidebarLayout } from "./layout/SidebarLayout";
import { Markup } from "./markup";
import { TitleAndBreadcrumb } from "./TitleAndBreadcrumb";
import { isDefined, useContextFromContentObjectTags } from "../../services";
import { PageFragment } from "./PageFragment";
import { useHistory } from "react-router";

interface BookProps {
    book: IsaacBookIndexPageDTO;
};

export const Book = ({ book }: BookProps) => {

    const [pageId, setPageId] = useState<string | undefined>(undefined);
    const history = useHistory();

    const pageContext = useContextFromContentObjectTags(book);

    useEffect(() => {
        const hash = history.location.hash;

        if (!hash) {
            setPageId(undefined);
            return;
        }

        const prefix = book.chapters?.[0]?.sections?.[0]?.pageId?.split("_").slice(0, 2).join("_") ?? "";
        const fragmentId = prefix + "_" + hash.replace("#", "");
        if (fragmentId) {
            setPageId(fragmentId);
        }
    }, [book.chapters, history.location.hash]);

    return <Container data-bs-theme={pageContext?.subject ?? "neutral"}>
        <TitleAndBreadcrumb 
            currentPageTitle={book.title ?? "Book"}
            icon={{type: "hex", icon: "page-icon-book"}}
        />
        <SidebarLayout>
            <BookSidebar book={book} pageId={pageId} />
            <MainContent className="mt-4">
                {isDefined(pageId) 
                    ? <PageFragment fragmentId={pageId} /> 
                    : <div>
                        <div className="book-image-container mx-3 float-end">
                            <img src={book.coverImage?.src} alt={book.title} />
                        </div>
                        <Markup className="d-contents" trusted-markup-encoding={"markdown"}>{book.value}</Markup>
                    </div>
                }
            </MainContent>
        </SidebarLayout>
    </Container>;
};

import React from "react";
import { useNavigate } from "react-router";
import { ISAAC_BOOKS, BookHiddenState } from "../../../services";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";

export const BooksOverviewSidebar = (props: ContentSidebarProps) => {
    const navigate = useNavigate();
    return <ContentSidebar buttonTitle="View all books" {...props}>
        <div className="section-divider"/>
        <div className="h5">Our books</div>
        <ul>
            {ISAAC_BOOKS.filter(book => book.hidden !== BookHiddenState.HIDDEN).map((book, index) => <li key={index}>
                <StyledTabPicker checkboxTitle={book.title} checked={false} onChange={() => navigate(book.path)}/>
            </li>)}
        </ul>
    </ContentSidebar>;
};

import React from "react";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";
import { MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import { BookHiddenState, BookInfo, ISAAC_BOOKS } from "../../services";
import { Link } from "react-router-dom";
import { PageMetadata } from "../elements/PageMetadata";
import { BooksOverviewSidebar } from "../elements/sidebar/BooksOverviewSidebar";

export const BookCard = (book: BookInfo) => {
    return <Link to={book.path} className="book-container d-flex p-2 gap-3">
        <div className="book-image-container">
            <img src={book.image} alt={book.title} className="h-100"/>
        </div>
        <div className="d-flex flex-column">
            <h5 className="pt-2 pt-2 pb-1 m-0">{book.title}</h5>
            <div className="section-divider"/>
            <span className="text-decoration-none">
                {book.description}
            </span>
        </div>
    </Link>;
};

export const BooksOverview = () => {
    return <Container>
        <TitleAndBreadcrumb 
            currentPageTitle="Our books"
            icon={{type: "icon", icon: "icon-book"}}
        />
        <SidebarLayout>
            <BooksOverviewSidebar hideButton />
            <MainContent>
                <PageMetadata title={"Isaac books: in print and online"} showSidebarButton sidebarButtonText="View all books"/>
                <PageFragment fragmentId="books_overview_fragment" />

                <h3>Explore our books online</h3>
                <span>Click on a book image below to go to the homepage of each book and explore further.</span>
                <div className="row mt-3 mb-7 row-cols-1 row-cols-md-2 row-cols-lg-1 row-cols-xxl-2">
                    {ISAAC_BOOKS.filter(b => b.hidden !== BookHiddenState.HIDDEN).map((book, index) => {
                        return <BookCard key={index} {...book} />;
                    })}
                </div>
            </MainContent>
        </SidebarLayout>        
    </Container>;
};

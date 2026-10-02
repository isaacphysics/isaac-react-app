import React from "react";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";
import { BookHiddenState, BookInfo, ISAAC_BOOKS, siteSpecific } from "../../services";
import { Link } from "react-router-dom";
import { PageMetadata } from "../elements/PageMetadata";
import { BooksOverviewSidebar } from "../elements/sidebar/BooksOverviewSidebar";
import { PageContainer } from "../elements/layout/PageContainer";
import { useTranslation } from "react-i18next";

export const BookCard = (book: BookInfo) => {
    return <div className="book-card">
        <Link to={book.path} className="book-container d-flex gap-3">
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
        </Link>
    </div>;
};

export const BooksOverview = () => {
    const { t } = useTranslation();
    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb 
                currentPageTitle={t("common:books.overview.title")}
                icon={{type: "icon", icon: "icon-book"}}
            />
        }
        sidebar={siteSpecific(
            <BooksOverviewSidebar hideButton />,
            undefined
        )}
    >
        <PageMetadata title={"Isaac books: in print and online"} showSidebarButton sidebarButtonText={t("common:books.overview.sidebarButton")}/>
        <PageFragment fragmentId="books_overview_fragment" />

        <h3>{t("common:books.overview.exploreTitle")}</h3>
        <span>{t("common:books.overview.exploreDescription")}</span>
        <div className="row mt-3 mb-7 row-cols-1 row-cols-md-2 row-cols-lg-1 row-cols-xxl-2">
            {ISAAC_BOOKS.filter(b => b.hidden !== BookHiddenState.HIDDEN).map((book, index) => {
                return <BookCard key={index} {...book} />;
            })}
        </div>
    </PageContainer>;
};

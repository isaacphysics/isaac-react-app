import React from "react";
import { Container, ContainerProps } from "reactstrap";
import { siteSpecific } from "../../../services";
import { MainContent, SidebarLayout } from "./SidebarLayout";
import classNames from "classnames";

interface PageContainerProps extends Omit<ContainerProps, "pageTitle"> {
    pageTitle?: React.ReactNode;
    sidebar?: React.ReactNode;
}

/**
 * A component to manage the main layout of a page, including the page title and sidebar if required.
 * @param props The props for the PageContainer component.
 *  @param props.pageTitle The title of the page, displayed above both the main content and the sidebar.
 *  @param props.sidebar The content of the sidebar. Displayed according to @see SidebarLayout. If not provided, the page will be displayed without a sidebar.
 *  @param props.children The main content of the page.
 * @returns A React component that renders the page layout.
 */
export const PageContainer = (props: PageContainerProps) => {
    const { children, sidebar, pageTitle, id, ...rest } = props;
    if (!sidebar) {
        return <Container {...rest} id={id} className={classNames("mb-7", rest.className)}>
            {pageTitle}
            {children}
        </Container>;
    }

    return siteSpecific(
        // Sci
        <Container {...rest} id={id} className={classNames("mb-7", rest.className)}>
            {pageTitle}
            <SidebarLayout show={!!sidebar}>
                {sidebar}
                <MainContent>
                    {children}
                </MainContent>
            </SidebarLayout>
        </Container>,

        // Ada
        // The ID is applied to the top-level component here to ensure #id:before / :after background elements cover the entire page.
        // Slightly annoying since the className feels like it should be on the Container, leaving this awkward split.
        // Maybe revisit this when we have more use cases?
        <SidebarLayout className="g-md-0" id={id} show={!!sidebar}>
            {sidebar}
            <MainContent className="overflow-x-auto">
                <Container fluid {...rest} className={classNames("my-ada-container mw-1600 px-md-4 px-lg-6 mb-7", rest.className)}>
                    {pageTitle}
                    {children}
                </Container>
            </MainContent>
        </SidebarLayout>
    );
};

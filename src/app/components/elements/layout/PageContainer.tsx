import React from "react";
import { Container, ContainerProps } from "reactstrap";
import { siteSpecific } from "../../../services";
import { MainContent, SidebarLayout } from "./SidebarLayout";
import classNames from "classnames";

interface PageContainerProps extends Omit<ContainerProps, "pageTitle"> {
    pageTitle?: React.ReactNode;
    sidebar?: React.ReactNode;
}

export const PageContainer = (props: PageContainerProps) => {
    const { children, sidebar, pageTitle, ...rest } = props;
    if (!sidebar) {
        return <Container {...rest} className={classNames("mb-7", rest.className)}>
            {pageTitle}
            {children}
        </Container>;
    }

    return siteSpecific(
        // Sci
        <Container {...rest} className={classNames("mb-7", rest.className)}>
            {pageTitle}
            <SidebarLayout>
                {sidebar}
                <MainContent>
                    {children}
                </MainContent>
            </SidebarLayout>
        </Container>,

        // Ada
        <SidebarLayout className="g-md-0">
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

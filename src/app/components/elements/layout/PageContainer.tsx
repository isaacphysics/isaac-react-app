import React from "react";
import { Container, ContainerProps } from "reactstrap";
import { siteSpecific } from "../../../services";
import { MainContent, SidebarLayout } from "./SidebarLayout";

interface PageContainerProps extends Omit<ContainerProps, "pageTitle"> {
    pageTitle?: React.ReactNode;
    sidebar?: React.ReactNode;
}

export const PageContainer = (props: PageContainerProps) => {
    const { children, sidebar, pageTitle, ...rest } = props;
    if (!sidebar) {
        return <Container {...rest}>
            {pageTitle}
            {children}
        </Container>;
    }

    return siteSpecific(
        // Sci
        <Container {...rest}>
            {pageTitle}
            <SidebarLayout>
                {sidebar}
                <MainContent>
                    {children}
                </MainContent>
            </SidebarLayout>
        </Container>,

        // Ada
        <SidebarLayout>
            {sidebar}
            <MainContent className="overflow-x-auto">
                <Container fluid {...rest} className="my-ada-container mw-1600 px-md-4 px-lg-6">
                    {pageTitle}
                    {children}
                </Container>
            </MainContent>
        </SidebarLayout>
    );
};

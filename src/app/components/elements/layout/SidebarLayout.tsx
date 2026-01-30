import React, { useEffect } from "react";
import { Col, ColProps, RowProps, Offcanvas, OffcanvasBody, OffcanvasHeader, Row } from "reactstrap";
import classNames from "classnames";
import { above, isAda, siteSpecific, useDeviceSize } from "../../../services";
import { mainContentIdSlice, selectors, sidebarSlice, useAppDispatch, useAppSelector } from "../../../state";
import { ContentSidebarContext } from "../../../../IsaacAppTypes";
import { AffixButton } from "../AffixButton";
import { SidebarButton } from "../SidebarButton";

export const SidebarLayout = (props: RowProps) => {
    const { className, ...rest } = props;
    return siteSpecific(<Row {...rest} className={classNames("sidebar-layout", className)}/>, props.children);
};

export const MainContent = (props: ColProps) => {
    const { className, ...rest } = props;

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(mainContentIdSlice.actions.set({id: "page-content", priority: 2}));
    }, [dispatch]);

    return siteSpecific(<Col id="page-content" xs={12} lg={8} xl={9} {...rest} tabIndex={-1} className={classNames(className, "order-0 order-lg-1")} />, props.children);
};

export type SidebarProps = ColProps

export const NavigationSidebar = (props: SidebarProps) => {
    // A navigation sidebar is used for external links that are supplementary to the main content (e.g. related content);
    // the content in such a sidebar will collapse underneath the main content on smaller screens
    if (isAda) return <></>;

    const { className, ...rest } = props;
    return <Col tag="aside" aria-label="Sidebar" lg={4} xl={3} {...rest} className={classNames("sidebar no-print p-4 order-1 order-lg-0", className)} />;
};

export interface ContentSidebarProps extends SidebarProps {
    buttonTitle?: string;
    hideButton?: boolean; // if true, the sidebar will not be collapsible on small screens
    optionBar?: React.JSX.Element;
}

export const ContentSidebar = (props: ContentSidebarProps) => {
    // A content sidebar is used to interact with the main content, e.g. filters or search boxes, or for in-page nav (e.g. lessons and revision);
    // the content in such a sidebar will collapse into a button accessible from above the main content on smaller screens
    const deviceSize = useDeviceSize();
    const dispatch = useAppDispatch();
    const sidebarOpen = useAppSelector(selectors.sidebar.open);
    const toggleMenu = () => dispatch(sidebarSlice.actions.toggle());
    const closeMenu = () => dispatch(sidebarSlice.actions.setOpen(false));

    const pageTheme = useAppSelector(selectors.pageContext.subject);

    if (isAda) return <></>;

    const { className, buttonTitle, hideButton, optionBar, ...rest } = props;
    return <>
        {above['lg'](deviceSize)
            ? <Col tag="aside" data-testid="sidebar" aria-label="Sidebar" lg={4} xl={3} {...rest} className={classNames("d-none d-lg-flex flex-column sidebar no-print p-4 order-0", className)} />
            : <>
                {optionBar && <div className="d-flex align-items-center no-print flex-wrap py-3 gap-3">
                    <div className="flex-grow-1 d-inline-grid align-items-end">{optionBar}</div>
                </div>}
                {!hideButton && <SidebarButton buttonTitle={buttonTitle} className="my-3"/>}
                <Offcanvas id="content-sidebar-offcanvas" direction="start" isOpen={sidebarOpen} toggle={toggleMenu} container="#root" data-bs-theme={pageTheme ?? "neutral"}>
                    <OffcanvasHeader toggle={toggleMenu} close={
                        <div className="d-flex w-100 justify-content-end align-items-center flex-wrap p-3">
                            <AffixButton color="keyline" size="lg" onClick={toggleMenu} data-testid="close-sidebar-button" affix={{
                                affix: "icon-close",
                                position: "prefix",
                                type: "icon"
                            }}>
                                Close
                            </AffixButton>
                        </div>
                    }/>
                    <OffcanvasBody>
                        <ContentSidebarContext.Provider value={{toggle: toggleMenu, close: closeMenu}}>
                            <Col {...rest} className={classNames("sidebar p-4 pt-0", className)} />
                        </ContentSidebarContext.Provider>
                    </OffcanvasBody>
                </Offcanvas>
            </>
        }
    </>;
};

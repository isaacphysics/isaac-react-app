import React, { useState } from "react";
import {Link} from "react-router-dom";
import {selectors, useAppSelector} from "../../../state";
import {Button, Col, Container, Offcanvas, OffcanvasBody, OffcanvasHeader, Row} from "reactstrap";
import {NavigationPanelPhy} from "./NavigationPanelPhy";
import {above, useDeviceSize} from "../../../services";
import { AffixButton } from "../../elements/AffixButton";
import { MenuOpenContext } from "../../navigation/NavigationBar";
import classNames from "classnames";

export const HeaderPhy = () => {
    const user = useAppSelector(selectors.user.orNull);
    const mainContentId = useAppSelector(selectors.mainContentId.orDefault);
    const deviceSize = useDeviceSize();
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(m => !m);

    const LoginLogoutButton = () => user && (user.loggedIn 
        ? <Link to="/logout">Log out</Link>
        : <Button color="solid" size="sm" tag={Link} to="/login">Sign up / log in</Button>
    );

    return <header className="bg-white" data-testid={"header"}>
        <Container fluid>
            <Row className="align-items-center">
                <Col className="d-flex justify-content-between py-3">
                    <div className="header-logo align-content-center">
                        <Link to="/">
                            <img src="/assets/phy/logo.svg" alt="Isaac Physics" className="d-none d-sm-block d-print-block"/>
                            <img src="/assets/phy/logo-small.svg" alt="Isaac Physics" className="d-block d-sm-none d-print-none p-2"/>
                        </Link>
                    </div>

                    <a href={`#${mainContentId}`} className="skip-main">Skip to main content</a>

                    {above["lg"](deviceSize) 
                        ? <>
                            {/* desktop menu bar */}
                            <div className="d-flex justify-content-end align-items-center flex-wrap py-3">
                                <NavigationPanelPhy className={classNames("flex-row")}/>
                                <LoginLogoutButton/>
                            </div>
                        </>
                        : <>
                            {/* mobile hamburger menu */}
                            <div className="d-flex justify-content-end align-items-center flex-wrap py-3 gap-3">
                                <LoginLogoutButton/>
                                <AffixButton color="tint" size="lg" onClick={toggleMenu} affix={{
                                    affix: "icon-menu", 
                                    position: "suffix", 
                                    type: "icon"
                                }}>Menu</AffixButton>
                            </div>

                            <MenuOpenContext.Provider value={{menuOpen, setMenuOpen}}>
                                <Offcanvas id="header-offcanvas" direction="end" isOpen={menuOpen} toggle={toggleMenu} container="#root">
                                    <OffcanvasHeader toggle={toggleMenu} className="justify-content-between" close={
                                        <div className="d-flex justify-content-end align-items-center flex-wrap gap-3 py-3">
                                            <LoginLogoutButton/>
                                            <AffixButton color="tint" size="lg" onClick={toggleMenu} affix={{
                                                affix: "icon-close", 
                                                position: "suffix", 
                                                type: "icon"
                                            }}>Menu</AffixButton>
                                        </div>
                                    }>
                                        <Link to="/">
                                            <img src="/assets/phy/logo-small.svg" alt="Isaac Physics" className="d-block"/>
                                        </Link>
                                    </OffcanvasHeader>
                                    <OffcanvasBody>
                                        <NavigationPanelPhy/>
                                    </OffcanvasBody>
                                </Offcanvas>
                            </MenuOpenContext.Provider>
                        </>
                    }
                </Col>
            </Row>
        </Container>
    </header>;
};

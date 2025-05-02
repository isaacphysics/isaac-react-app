import React, { useState } from "react";
import {Link} from "react-router-dom";
import {selectors, useAppSelector} from "../../../state";
import {Button, Col, Container, Nav, Offcanvas, OffcanvasBody, OffcanvasHeader, Row} from "reactstrap";
import {HeaderMenuPhy} from "./HeaderMenuPhy";
import {above, useDeviceSize} from "../../../services";
import { AffixButton } from "../../elements/AffixButton";
import { MenuOpenContext } from "../../navigation/NavigationBar";
import classNames from "classnames";
import { NavigationMenuPhy } from "./NavigationMenuPhy";

export const LoginLogoutButton = (props : React.HTMLAttributes<HTMLElement>) => {
    const user = useAppSelector(selectors.user.orNull);
    
    return user && (user.loggedIn 
        ? <Link to="/logout" {...props}>Log out</Link>
        : <Button color="solid" size="sm" tag={Link} to="/login" {...props}>Sign up / log in</Button>
    );
};

export const HeaderPhy = () => {
    const mainContentId = useAppSelector(selectors.mainContentId.orDefault);
    const deviceSize = useDeviceSize();
    const [menuOpen, setMenuOpen] = useState(false);
    const toggleMenu = () => setMenuOpen(m => !m);

    return <header className="bg-white" data-testid={"header"}>
        <Container>
            <Row className="align-items-center">
                <Col className="d-flex justify-content-between py-3">
                    <div className="header-logo align-content-center">
                        <Link to="/">
                            <img src="/assets/phy/logo.svg" alt="Isaac Physics" className="d-none d-sm-block d-print-block"/>
                            <img src="/assets/phy/logo-small.svg" alt="Isaac Physics" className="d-block d-sm-none d-print-none"/>
                        </Link>
                    </div>

                    <a href={`#${mainContentId}`} className="skip-main">Skip to main content</a>

                    {above["lg"](deviceSize) 
                        ? <>
                            {/* desktop menu bar */}
                            <div className="d-flex justify-content-end align-items-center flex-wrap py-3">
                                <HeaderMenuPhy className={classNames("flex-row")} toggleMenu={toggleMenu}/>
                                <LoginLogoutButton/>
                            </div>
                        </>
                        : <>
                            {/* mobile hamburger menu */}
                            <div className="d-flex justify-content-end align-items-center flex-wrap py-3 gap-3">
                                <LoginLogoutButton/>
                                <AffixButton color="tint" size="lg" onClick={toggleMenu} data-testid="nav-menu-toggle" affix={{
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
                                        <HeaderMenuPhy toggleMenu={toggleMenu}/>
                                    </OffcanvasBody>
                                </Offcanvas>
                            </MenuOpenContext.Provider>
                        </>
                    }
                </Col>
            </Row>
        </Container>
        {above["md"](deviceSize) && <Container id="content-nav-container">
            <Row>
                <Col>
                    <Nav tag="nav" className="d-flex align-items-end" id="content-nav">
                        <NavigationMenuPhy toggleMenu={toggleMenu}/>
                    </Nav>
                </Col>
            </Row>
        </Container>}
    </header>;
};

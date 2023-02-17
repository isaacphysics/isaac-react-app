import React, {useState} from "react";
import {SearchButton, SearchInput} from "./SearchButton";
import {isPhy} from "../../services";
import {Collapse, Nav, Navbar, NavbarToggler, NavItem} from "reactstrap";
import classNames from "classnames";

export const MainSearch = () => {
    const [showSearchBox, setShowSearchBox] = useState(false);

    return <Navbar className='search' expand='md'>
        <NavbarToggler
            className={showSearchBox ? 'open' : ''} aria-label={showSearchBox ? 'Close search menu' : 'Open search menu'}
            onClick={() => setShowSearchBox(!showSearchBox)}
        />
        <Collapse navbar isOpen={showSearchBox}>
            <Nav className={classNames("ml-auto",{"mb-3 mb-md-0": isPhy})} navbar id="search-menu">
                <NavItem>
                    <SearchInput button={<SearchButton/>} prompt={"Search"}/>
                </NavItem>
            </Nav>
        </Collapse>
    </Navbar>;
};

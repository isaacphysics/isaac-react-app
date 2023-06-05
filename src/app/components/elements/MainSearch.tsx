import React, {ChangeEvent, FormEvent, useEffect, useRef, useState} from "react";
import {SearchButton} from "./SearchButton";
import {pushSearchToHistory, SEARCH_CHAR_LENGTH_LIMIT} from "../../services";
import {History} from "history";
import {withRouter} from "react-router";
import {Collapse, Form, FormGroup, Input, Label, Nav, Navbar, NavbarToggler, NavItem} from "reactstrap";
import {useLocation} from "react-router-dom";

interface MainSearchProps {
    history: History;
}

const MainSearchComponent = ({history}: MainSearchProps) => {
    const [searchText, setSearchText] = useState("");
    const [showSearchBox, setShowSearchBox] = useState(false);

    const searchInputRef = useRef<HTMLInputElement>(null);
    function doSearch(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (searchText == "") {
            if (searchInputRef.current) searchInputRef.current.focus();
        } else {
            pushSearchToHistory(history, searchText, []);
        }
    }

    // Clear this search field on location (i.e. search query) change - user should use the main search bar
    const location = useLocation();
    useEffect(() => { if (location.pathname === "/search") { setSearchText(""); }}, [location]);

    function setSearchTextAsValue(e: ChangeEvent<HTMLInputElement>) {
        setSearchText(e.target.value);
    }

    return <Navbar className='search' expand='md'>
        <NavbarToggler
            className={showSearchBox ? 'open' : ''} aria-label={showSearchBox ? 'Close search menu' : 'Open search menu'}
            onClick={() => setShowSearchBox(!showSearchBox)}
        />
        <Collapse navbar isOpen={showSearchBox}>
            <Nav className="ml-auto" navbar id="search-menu">
                <NavItem>
                    <Form inline onSubmit={doSearch}>
                        <FormGroup className='search--main-group'>
                            <Label for='header-search' className='sr-only'>Search</Label>
                            <Input
                                id="header-search" type="search" name="query" placeholder="Search" aria-label="Search"
                                value={searchText} onChange={setSearchTextAsValue} innerRef={searchInputRef} maxLength={SEARCH_CHAR_LENGTH_LIMIT}
                            />
                            <SearchButton />
                            <input type="hidden" name="types" value="isaacQuestionPage,isaacConceptPage" />
                        </FormGroup>
                    </Form>
                </NavItem>
            </Nav>
        </Collapse>
    </Navbar>;
};

export const MainSearch = withRouter(MainSearchComponent);

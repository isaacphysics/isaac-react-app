import React, {ChangeEvent, useState} from "react";
import {SearchButton} from "./SearchButton";
import {pushSearchToHistory} from "../../services/search";
import {History} from "history";
import {withRouter} from "react-router";
import {Collapse, Form, FormGroup, Input, Label, Nav, Navbar, NavbarToggler, NavItem} from "reactstrap";

interface MainSearchProps {
    history: History;
}

const MainSearchComponent = ({history}: MainSearchProps) => {
    const [searchText, setSearchText] = useState("");
    const [showSearchBox, setShowSearchBox] = useState(false);

    function doSearch(e: Event) {
        e.preventDefault();
        pushSearchToHistory(history, searchText, true, true);
    }

    function setSearchTextAsValue(e: ChangeEvent<HTMLInputElement>) {
        setSearchText(e.target.value);
    }

    return <Navbar className='search' expand='md'>
        <NavbarToggler onClick={() => setShowSearchBox(!showSearchBox)} className={showSearchBox && 'open'} />
        <Collapse navbar isOpen={showSearchBox}>
            <Nav className='ml-auto' navbar>
                <NavItem>
                    <Form inline onSubmit={doSearch}>
                        <FormGroup className='search--main-group'>
                            <Label for='search' className='sr-only'>Search</Label>
                            <Input
                                type="search" name="query" placeholder="Search" aria-label="Search"
                                value={searchText} onChange={setSearchTextAsValue}
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

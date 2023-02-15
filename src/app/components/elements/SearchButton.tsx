import React, {ChangeEvent, FormEvent, useEffect, useRef, useState} from "react";
import {Button, Form, FormGroup, Input, Label} from "reactstrap";
import {pushSearchToHistory, SEARCH_CHAR_LENGTH_LIMIT, siteSpecific} from "../../services";
import {useHistory, useLocation} from "react-router-dom";

const PhysicsSearchButton = () => (
    <Button color='link' aria-label='search' className='search-button'>
        <svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>
            <g fill='none' fillRule='evenodd'>
                <rect width='32' height='32' x='2' y='2' fill='#000' fillRule='nonzero' stroke='#000' strokeWidth='4' rx='16' />
                <path fill='#FFF' d='M27.5 25.333l-4.43-4.396a6.82 6.82 0 0 0 1.325-4.045c0-3.8-3.116-6.892-6.948-6.892-3.83 0-6.947 3.092-6.947 6.892 0 3.801 3.117 6.892 6.947 6.892a6.95 6.95 0 0 0 3.918-1.203L25.82 27l1.681-1.667zm-14.962-8.44c0-2.687 2.203-4.872 4.91-4.872 2.708 0 4.91 2.185 4.91 4.871 0 2.686-2.202 4.871-4.91 4.871s-4.91-2.185-4.91-4.87z' />
            </g>
        </svg>
        <span className='sr-only'>Search</span>
    </Button>
);

const AdaSearchButton = () => (
    <Button color="link" aria-label="search" className="search-button">
        <svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>
            <g fill='none' fillRule='evenodd'>
                <path fill='#000' d='M27.5 25.333l-4.43-4.396a6.82 6.82 0 0 0 1.325-4.045c0-3.8-3.116-6.892-6.948-6.892-3.83 0-6.947 3.092-6.947 6.892 0 3.801 3.117 6.892 6.947 6.892a6.95 6.95 0 0 0 3.918-1.203L25.82 27l1.681-1.667zm-14.962-8.44c0-2.687 2.203-4.872 4.91-4.872 2.708 0 4.91 2.185 4.91 4.871 0 2.686-2.202 4.871-4.91 4.871s-4.91-2.185-4.91-4.87z' />
            </g>
        </svg>
        <span className='sr-only'>Search</span>
    </Button>
);

export const SearchButton = siteSpecific(PhysicsSearchButton, AdaSearchButton);

export const LongSearchButton = () => (
    <Button color="link" aria-label="search" className="long-search-button">
        <svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>
            <g fill='none' fillRule='evenodd'>
                <path fill='#FFF' d='M27.5 25.333l-4.43-4.396a6.82 6.82 0 0 0 1.325-4.045c0-3.8-3.116-6.892-6.948-6.892-3.83 0-6.947 3.092-6.947 6.892 0 3.801 3.117 6.892 6.947 6.892a6.95 6.95 0 0 0 3.918-1.203L25.82 27l1.681-1.667zm-14.962-8.44c0-2.687 2.203-4.872 4.91-4.872 2.708 0 4.91 2.185 4.91 4.871 0 2.686-2.202 4.871-4.91 4.871s-4.91-2.185-4.91-4.87z' />
            </g>
        </svg>
        <span className='sr-only'>Search</span>
    </Button>
);


interface SearchInputProps {
    button: React.ReactNode;
    className?: string;
    prompt: string;
}

export const SearchInput = ({button, className, prompt}: SearchInputProps) => {
    const [searchText, setSearchText] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    const history = useHistory();
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

    return <Form inline onSubmit={doSearch} className={className}>
        <FormGroup className='search--main-group'>
            <Label for='header-search' className='sr-only'>{prompt}</Label>
            <Input
                id="header-search" type="search" name="query" placeholder={prompt} aria-label="Search"
                value={searchText} onChange={setSearchTextAsValue} innerRef={searchInputRef} maxLength={SEARCH_CHAR_LENGTH_LIMIT}
            />
            {button}
            <input type="hidden" name="types" value="isaacQuestionPage,isaacConceptPage" />
        </FormGroup>
    </Form>;
};
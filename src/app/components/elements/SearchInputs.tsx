import React, {ChangeEvent} from "react";
import {Button, Input, InputGroup, InputProps, Label} from "reactstrap";
import {ifKeyIsEnter, SEARCH_CHAR_LENGTH_LIMIT, siteSpecific, withSearch} from "../../services";

const PhysicsSearchButton = () => (
    <Button color='link' aria-label='search' className='search-button'>
        <i className="icon icon-search icon-color-black me-1 align-self-center"/>
        <span className='visually-hidden'>Search</span>
    </Button>
);

const AdaSearchButton = () => (
    <Button color="link" aria-label="search" className="search-button">
        <svg xmlns='http://www.w3.org/2000/svg' width='36' height='36' viewBox='0 0 36 36'>
            <g fill='none' fillRule='evenodd'>
                <path fill='#000' d='M27.5 25.333l-4.43-4.396a6.82 6.82 0 0 0 1.325-4.045c0-3.8-3.116-6.892-6.948-6.892-3.83 0-6.947 3.092-6.947 6.892 0 3.801 3.117 6.892 6.947 6.892a6.95 6.95 0 0 0 3.918-1.203L25.82 27l1.681-1.667zm-14.962-8.44c0-2.687 2.203-4.872 4.91-4.872 2.708 0 4.91 2.185 4.91 4.871 0 2.686-2.202 4.871-4.91 4.871s-4.91-2.185-4.91-4.87z' />
            </g>
        </svg>
        <span className='visually-hidden'>Search</span>
    </Button>
);

const SearchButton = siteSpecific(PhysicsSearchButton, AdaSearchButton);

const LongSearchButton = () => (
    <Button color="link" aria-label="search" className="long-search-button">
        <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'>
            <g fill='none' fillRule='evenodd'>
                <path fill='#FFF' d='M27.5 25.333l-4.43-4.396a6.82 6.82 0 0 0 1.325-4.045c0-3.8-3.116-6.892-6.948-6.892-3.83 0-6.947 3.092-6.947 6.892 0 3.801 3.117 6.892 6.947 6.892a6.95 6.95 0 0 0 3.918-1.203L25.82 27l1.681-1.667zm-14.962-8.44c0-2.687 2.203-4.872 4.91-4.872 2.708 0 4.91 2.185 4.91 4.871 0 2.686-2.202 4.871-4.91 4.871s-4.91-2.185-4.91-4.87z' />
            </g>
        </svg>
        <span className='visually-hidden'>Search</span>
    </Button>
);

export const PhySearchInput = withSearch(({inputProps, setSearchText, searchText}) => {
    function setSearchTextAsValue(e: ChangeEvent<HTMLInputElement>) {
        setSearchText(e.target.value);
    }
    return <>
        <Label for='header-search' className='visually-hidden'>Search</Label>
        <Input
            id="header-search" {...inputProps}
            value={searchText} onChange={setSearchTextAsValue}
        />
        <SearchButton/>
    </>;
});

export const AdaSearchInput = withSearch(({inputProps, setSearchText, searchText}) => {
    function setSearchTextAsValue(e: ChangeEvent<HTMLInputElement>) {
        setSearchText(e.target.value);
    }
    return <>
        <Label for='header-search' className='visually-hidden'>Search</Label>
        <Input
            id="header-search" {...inputProps}
            value={searchText} onChange={setSearchTextAsValue}
        />
        <SearchButton/>
    </>;
});

export const PhySimpleSearch = withSearch(({inputProps, setSearchText, searchText}) => {
    function setSearchTextAsValue(e: ChangeEvent<HTMLInputElement>) {
        setSearchText(e.target.value);
    }
    return <Input
        className='search--filter-input mt-4'
        {...inputProps}
        value={searchText} onChange={setSearchTextAsValue}
    />;
});

export const AdaHomepageSearch = withSearch(({inputProps, setSearchText, searchText}) => {
    function setSearchTextAsValue(e: ChangeEvent<HTMLInputElement>) {
        setSearchText(e.target.value);
    }
    return <>
        <Label for='homepage-search' className='visually-hidden'>Search</Label>
        <InputGroup id={"homepage-search-group"}>
            <Input
                id="homepage-search" {...inputProps} placeholder={"Search your topic here"}
                value={searchText} onChange={setSearchTextAsValue}
            />
            <LongSearchButton/>
        </InputGroup>
    </>;
});

export const AdaHeaderSearch = withSearch(({inputProps, setSearchText, searchText}) => {
    function setSearchTextAsValue(e: ChangeEvent<HTMLInputElement>) {
        setSearchText(e.target.value);
    }
    return <>
        <Label for='header-search' className='visually-hidden'>Search</Label>
        <InputGroup id={"header-search-group"}>
            <Input
                id="header-search" {...inputProps}
                value={searchText} onChange={setSearchTextAsValue}
            />
            <button>
                <img src={"/assets/cs/icons/search-jet.svg"}/>
            </button>
        </InputGroup>
    </>;
});

export const SearchPageSearch = siteSpecific(PhySimpleSearch, AdaHeaderSearch);
export const MainSearchInput = siteSpecific(PhySearchInput, AdaSearchInput);


interface SearchButtonWithIconProps extends InputProps {
    onSearch?: () => void;
}

export const SearchInputWithIcon = (props: SearchButtonWithIconProps) => {
    const {onSearch, ...rest} = props;
    return <InputGroup className="search-input-icon">
        <Input {...rest}
            id="question-search-title"
            type="text"
            maxLength={SEARCH_CHAR_LENGTH_LIMIT}
            {...(onSearch ? {"onKeyDown": ifKeyIsEnter(onSearch)} : {})}
        />
        <button className="d-flex align-items-center justify-content-center" onClick={onSearch} aria-label="Search">
            <i className="icon icon-search" color="tertiary"/>
        </button>
    </InputGroup>;
}

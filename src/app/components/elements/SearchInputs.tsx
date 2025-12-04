import React, {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";
import {Button, Form, Input, InputGroup, InputProps, Label} from "reactstrap";
import {ifKeyIsEnter, SEARCH_CHAR_LENGTH_LIMIT, siteSpecific} from "../../services";
import classNames from "classnames";

interface SearchInputProps {
    setSearchText: (s: string) => void;
    searchText: string;
    inputProps: {
        innerRef: React.RefObject<HTMLInputElement>;
        "aria-label": "Search";
        type: "search";
        name: "query";
        maxLength: typeof SEARCH_CHAR_LENGTH_LIMIT;
        placeholder: "Search";
    };
}

// HOC pattern for making different flavour search bars
function withSearch(Component: React.FC<SearchInputProps>) {
    const SearchComponent = ({className, inline, onSearch, initialValue, clearOnSearch}: {className?: string; inline?: boolean; onSearch?: (searchText: string) => void; initialValue?: string, clearOnSearch?: boolean}) => {
        const [searchText, setSearchText] = useState(initialValue ?? "");
        const searchInputRef = useRef<HTMLInputElement>(null);

        const doSearch = useCallback((text: string) => {
            if (text === "") {
                if (searchInputRef.current) searchInputRef.current.focus();
            } else {
                onSearch?.(encodeURIComponent(text));
                if (clearOnSearch) setSearchText("");
            }
        }, [onSearch, clearOnSearch]);

        useEffect(() => {
            // If the initial value changes, update the search text - allows the search input to reflect URL changes
            if (initialValue !== undefined) {
                setSearchText(initialValue);
            }
        }, [initialValue]);

        return <Form 
            className={classNames(className, {"form-inline" : inline})}
            data-testid="search-form"
            onSubmit={(e) => {
                e.preventDefault();
                doSearch(searchText);
            }}
        >
            <div className='form-group search--main-group'>
                <Component inputProps={{
                    maxLength: SEARCH_CHAR_LENGTH_LIMIT,
                    type: "search",
                    name: "query",
                    "aria-label": "Search",
                    innerRef: searchInputRef,
                    placeholder: "Search"
                }} setSearchText={setSearchText} searchText={searchText} />
                <input type="hidden" name="types" value="isaacQuestionPage,isaacConceptPage" />
            </div>
        </Form>;
    };
    SearchComponent.displayName = "SearchComponent";
    return SearchComponent;
}

const PhysicsSearchButton = () => {
    return <button aria-label='search' className='d-flex bg-transparent search-button justify-content-center align-items-center'>
        <i className="icon icon-search icon-color-black"/>
        <span className='visually-hidden'>Search</span>
    </button>;
};

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

export const MainSearchInput = withSearch(({inputProps, setSearchText, searchText}) => {
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

const PhySimpleSearch = withSearch(({inputProps, setSearchText, searchText}) => {
    function setSearchTextAsValue(e: ChangeEvent<HTMLInputElement>) {
        setSearchText(e.target.value);
    }
    return <Input
        className='search--filter-input mt-4'
        {...inputProps}
        value={searchText} onChange={setSearchTextAsValue}
    />;
});


export const AdaHeaderSearch = withSearch(({inputProps, setSearchText, searchText}) => {
    function setSearchTextAsValue(e: ChangeEvent<HTMLInputElement>) {
        setSearchText(e.target.value);
    }
    return <>
        <Label for='header-search' className='visually-hidden'>Search</Label>
        <InputGroup id={"header-search-group"} className="d-flex flex-nowrap">
            <Input
                id="header-search" {...inputProps}
                value={searchText} onChange={setSearchTextAsValue}
            />
            <button className="d-flex align-items-center justify-content-center">
                <i className="icon icon-search icon-color-jet"/>
            </button>
        </InputGroup>
    </>;
});

export const SearchPageSearch = siteSpecific(PhySimpleSearch, AdaHeaderSearch);

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
};

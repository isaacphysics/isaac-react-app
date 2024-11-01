import React from "react";
import { Button } from "reactstrap";

export const SearchButton = () => (
  <Button color="link" aria-label="search" className="search-main">
    <span className="search-wrapper">
      {" "}
      <span className="search-text">Search</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <g fill="none" fillRule="evenodd">
          <path
            fill="#FFF"
            d="M27.5 25.333l-4.43-4.396a6.82 6.82 0 0 0 1.325-4.045c0-3.8-3.116-6.892-6.948-6.892-3.83 0-6.947 3.092-6.947 6.892 0 3.801 3.117 6.892 6.947 6.892a6.95 6.95 0 0 0 3.918-1.203L25.82 27l1.681-1.667zm-14.962-8.44c0-2.687 2.203-4.872 4.91-4.872 2.708 0 4.91 2.185 4.91 4.871 0 2.686-2.202 4.871-4.91 4.871s-4.91-2.185-4.91-4.87z"
          />
        </g>
      </svg>
    </span>
  </Button>
);

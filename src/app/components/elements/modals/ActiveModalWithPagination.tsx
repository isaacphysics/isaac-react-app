import React, { useState } from "react";
import { closeActiveModal } from "../../../state";
import { useDispatch } from "react-redux";
import { ActiveModal } from "./ActiveModal";

interface ActiveModalWithPagination {
    title: string;
    pages: React.ReactNode[];
    buttons: (p: PaginationState) => React.ReactNode[];
}

export interface PaginationState {
    pageIndex: number;
    setPage: (pageIndex: number) => void;
    close: () => void;
}

export const ActiveModalWithPagination = ({ title, pages, buttons }: ActiveModalWithPagination) => {
    const dispatch = useDispatch();
    const [pageIndex, setPage] = useState(1);
    const close = () => dispatch(closeActiveModal());;
    
    const header = <div className="d-flex justify-content-between px-4 pt-3 pb-2 border-bottom">
        <strong role="region" aria-label="Modal page indicator" className="text-theme">{pageIndex} of {pages.length}</strong>
        <button aria-label="Close modal" className="icon icon-close" onClick={close} />
    </div>;

    const body = <>
        {pages.map((page, idx) => <div key={idx} style={pageIndex === (idx + 1) ? {} : {display: "none"}}>{ page }</div>)}
    </>;

    return <ActiveModal activeModal={{title, size: 'md', centered: true, header, body, buttons: buttons({ pageIndex, setPage, close}) }}/>;
};

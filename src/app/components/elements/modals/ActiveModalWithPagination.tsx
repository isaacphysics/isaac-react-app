import React, { useState } from "react";
import { type ActiveModalWithState } from "../../../../IsaacAppTypes";
import { closeActiveModal } from "../../../state";
import { useDispatch } from "react-redux";

interface ActiveModalWithPagination {
    pages: React.ReactNode[];
    title: string;
    useInit: () => void;
    buttons: (state: PaginationState) => React.ReactNode[];
}

export interface PaginationState {
    pageIndex: number;
    setPage: (pageIndex: number) => void;
    close: () => void;
}

export const activeModalWithPagination = ({ title, pages, buttons, useInit }: ActiveModalWithPagination): ActiveModalWithState<PaginationState> => {
    return {
        size: 'md',
        title,
        useInit() {
            useInit();
            const dispatch = useDispatch();
            const close = () => dispatch(closeActiveModal());;
            const [pageIndex, setPage] = useState(1);
            return { pageIndex, setPage, close };
        },
        header({ pageIndex, close }) {
            return <div className="d-flex justify-content-between px-4 pt-3 pb-2 border-bottom">
                <strong role="region" aria-label="Modal page indicator" className="color-purple">{pageIndex} of {pages.length}</strong>
                <button aria-label="Close modal" className="icon icon-close" onClick={close} />
            </div>;
        },
        body: ({ pageIndex }) => {
            return <>
                {pages.map((page, idx) => <div key={idx} style={pageIndex === (idx + 1) ? {} : {display: "none"}}>{page}</div>)}
            </>;
        },
        buttons
    };
};

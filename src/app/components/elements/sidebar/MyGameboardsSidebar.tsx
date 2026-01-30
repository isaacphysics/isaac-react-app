import classNames from "classnames";
import React, { ChangeEvent } from "react";
import { Input } from "reactstrap";
import { BoardViews, BoardLimit, BoardCreators, BoardCompletions, useDeviceSize, above, getSearchPlaceholder } from "../../../services";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { Spacer } from "../Spacer";

interface MyGameboardsSidebarProps extends ContentSidebarProps {
    displayMode: BoardViews;
    setDisplayMode: React.Dispatch<React.SetStateAction<BoardViews>>;
    displayLimit: BoardLimit;
    setDisplayLimit: React.Dispatch<React.SetStateAction<BoardLimit>>;
    boardTitleFilter: string,
    setBoardTitleFilter: React.Dispatch<React.SetStateAction<string>>;
    boardCreatorFilter: BoardCreators;
    setBoardCreatorFilter: React.Dispatch<React.SetStateAction<BoardCreators>>;
    boardCompletionFilter: BoardCompletions;
    setBoardCompletionFilter: React.Dispatch<React.SetStateAction<BoardCompletions>>;
    forceAllBoards?: boolean;
}

export const MyGameboardsSidebar = (props: MyGameboardsSidebarProps) => {
    const { displayMode, setDisplayMode, displayLimit, setDisplayLimit, boardTitleFilter, setBoardTitleFilter, boardCreatorFilter, setBoardCreatorFilter, boardCompletionFilter, setBoardCompletionFilter, forceAllBoards, ...rest } = props;

    const deviceSize = useDeviceSize();

    return <ContentSidebar {...rest} className={classNames(rest.className, "pt-0")}>
        {above["lg"](deviceSize) && <div className="section-divider"/>}
        <search>
            <h5>Search question decks</h5>
            <Input
                data-testid="title-filter"
                className='search--filter-input my-3'
                type="search" value={boardTitleFilter || ""}
                placeholder={`e.g. ${getSearchPlaceholder()}`}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setBoardTitleFilter(e.target.value)}
            />
            <div className="section-divider"/>
            <h5 className="mb-3">Filter by creator</h5>
            <Input type="select" value={boardCreatorFilter} onChange={e => setBoardCreatorFilter(e.target.value as BoardCreators)}>
                {Object.values(BoardCreators).map(creator => <option key={creator} value={creator}>{creator}</option>)}
            </Input>
            <h5 className="mt-4 mb-3">Filter by completion</h5>
            <Input type="select" value={boardCompletionFilter} onChange={e => setBoardCompletionFilter(e.target.value as BoardCompletions)}>
                {Object.values(BoardCompletions).map(completion => <option key={completion} value={completion}>{completion}</option>)}
            </Input>
            <div className="section-divider"/>
            <h5 className="mb-4">Display</h5>
            <div className="d-flex flex-xl-column flex-xxl-row">
                <Input className="w-auto" type="select" aria-label="Set display mode" data-testid="display-select" value={displayMode} onChange={e => setDisplayMode(e.target.value as BoardViews)}>
                    {Object.values(BoardViews).map(view => <option key={view} value={view}>{view}</option>)}
                </Input>
                {deviceSize === "xl" ? <div className="mt-2"/> : <Spacer/>}
                <div className="select-pretext me-2">Limit:</div>
                <Input disabled={forceAllBoards} className="w-auto" type="select" aria-label="Set display limit" data-testid="limit-select" value={displayLimit} onChange={e => setDisplayLimit(e.target.value as BoardLimit)}>
                    {Object.values(BoardLimit).map(limit => <option key={limit} value={limit}>{limit}</option>)}
                </Input>
            </div>
        </search>
    </ContentSidebar>;
};
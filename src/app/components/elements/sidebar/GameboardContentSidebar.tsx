import classNames from "classnames";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { GameboardItem, IsaacWildcard } from "../../../../IsaacApiTypes";
import { isAppLink, PATHS } from "../../../services";
import { ExternalLink } from "../ExternalLink";
import { NavigationSidebar } from "../layout/SidebarLayout";
import { Markup } from "../markup";
import { QuestionLink, CompletionKey } from "./SidebarElements";

interface GameboardContentSidebarProps {
    id: string;
    title: string;
    questions: GameboardItem[];
    wildCard?: IsaacWildcard;
    currentContentId?: string;
}

export const GameboardContentSidebar = (props: GameboardContentSidebarProps) => {
    // For questions in the context of a gameboard
    const {id, title, questions, wildCard, currentContentId} = props;

    const wildCardContents = useMemo(() => {
        if (!wildCard?.url) return null;

        const isExternal = !isAppLink(wildCard.url);
        const externalUrl = isExternal && wildCard.url?.replace(/^https?:\/\//, '').split('/')[0];

        return <>
            <i className="icon icon-concept-thick ms-2"/>
            <div className="d-flex flex-column w-100 overflow-hidden">
                <span className="hover-underline link-title"><Markup encoding="latex">{wildCard?.title}</Markup></span>
                <span className="text-muted small text-overflow-ellipsis">
                    {isExternal
                        ? <>External link (<em>{externalUrl}</em>)</>
                        : wildCard.description ?? wildCard.subtitle
                    }
                </span>
            </div>
        </>;
    }, [wildCard]);

    return <NavigationSidebar>
        <div className="section-divider"/>
        <Link to={`${PATHS.GAMEBOARD}#${id}`} style={{textDecoration: "none"}}>
            <h5 className="mb-3">Question deck: {title}</h5>
        </Link>
        <ul>
            {wildCard && wildCard.url && <li className={classNames("board-sidebar-content", {"selected-content": wildCard.url === window.location.pathname})}>
                {isAppLink(wildCard.url)
                    ? <Link className="py-2" to={`${wildCard.url}?board=${id}`}>{wildCardContents}</Link>
                    : <ExternalLink className="py-2" href={wildCard.url}>{wildCardContents}</ExternalLink>
                }
            </li>}
            {questions?.map(q => <li key={q.id}><QuestionLink question={q} gameboardId={id} className={classNames("board-sidebar-content", {"selected-content": q.id === currentContentId})}/></li>)}
        </ul>
        <div className="section-divider"/>
        <CompletionKey/>
    </NavigationSidebar>;
};
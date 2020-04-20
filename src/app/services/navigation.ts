import React, {useEffect} from "react";
import {history} from "./history";
import queryString from "query-string";
import {fetchTopicSummary, loadGameboard} from "../state/actions";
import {useDispatch, useSelector} from 'react-redux'
import {AppState} from "../state/reducers";
import {determineGameboardHistory, determineNextGameboardItem} from "./gameboards";
import {NOT_FOUND, TAG_ID} from "./constants";
import {determineNextTopicContentLink, determineTopicHistory, makeAttemptAtTopicHistory} from "./topics";
import {useCurrentExamBoard} from "./examBoard";

export interface LinkInfo {title: string; to?: string}
export type CollectionType = "Gameboard" | "Topic";
export interface PageNavigation {
    collectionType?: CollectionType;
    breadcrumbHistory: LinkInfo[];
    backToCollection?: LinkInfo;
    nextItem?: LinkInfo;
    queryParams?: string;
}

const defaultPageNavigation = {
    breadcrumbHistory: [],
};

export const useNavigation = (currentDocId: string): PageNavigation => {
    const queryParams = queryString.parse(history.location.search);
    const dispatch = useDispatch();

    useEffect(() => {
        if (queryParams.board) dispatch(loadGameboard(queryParams.board as string));
        if (queryParams.topic) dispatch(fetchTopicSummary(queryParams.topic as TAG_ID));
    }, [queryParams.board, queryParams.topic, currentDocId, dispatch]);

    const currentGameboard = useSelector((state: AppState) => state && state.currentGameboard);
    const currentTopic = useSelector((state: AppState) => state && state.currentTopic);
    const examBoard = useCurrentExamBoard();

    if (queryParams.board) {
        const gameboardHistory = (currentGameboard && currentGameboard != 404 && queryParams.board === currentGameboard.id) ?
            determineGameboardHistory(currentGameboard) :
            [];
        return {
            collectionType: "Gameboard",
            breadcrumbHistory: gameboardHistory,
            backToCollection: gameboardHistory.slice(-1)[0],
            nextItem: determineNextGameboardItem(currentGameboard, currentDocId),
            queryParams: history.location.search,
        }
    }

    if (queryParams.topic) {
        const topicHistory = (currentTopic && currentTopic != NOT_FOUND && currentTopic.id && queryParams.topic === currentTopic.id.slice("topic_summary_".length)) ?
            determineTopicHistory(currentTopic, currentDocId) :
            makeAttemptAtTopicHistory();
        return {
            collectionType: "Topic",
            breadcrumbHistory: topicHistory,
            backToCollection: topicHistory.slice(-1)[0],
            nextItem: determineNextTopicContentLink(currentTopic, currentDocId, examBoard),
            queryParams: history.location.search,
        }
    }

    return defaultPageNavigation;
};

export const ifKeyIsEnter = (action: () => void) => (event: React.KeyboardEvent) => {
    if (event.keyCode === 13) {
        action();
    }
};

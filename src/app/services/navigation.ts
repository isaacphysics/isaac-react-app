import React, {useEffect} from "react";
import queryString from "query-string";
import {fetchTopicSummary} from "../state/actions";
import {useAppDispatch, useAppSelector} from "../state/store";
import {
    determineCurrentCreationContext,
    determineGameboardHistory,
    determineNextGameboardItem,
    determinePreviousGameboardItem
} from "./gameboards";
import {DOCUMENT_TYPE, fastTrackProgressEnabledBoards, NOT_FOUND, TAG_ID} from "./constants";
import {determineNextTopicContentLink, determineTopicHistory, makeAttemptAtTopicHistory} from "./topics";
import {useUserContext} from "./userContext";
import {AudienceContext, ContentDTO} from "../../IsaacApiTypes";
import {NOT_FOUND_TYPE} from "../../IsaacAppTypes";
import {selectors} from "../state/selectors";
import {useLocation} from "react-router-dom";
import {isaacApi} from "../state/slices/api";

export interface LinkInfo {title: string; to?: string; replace?: boolean}
export type CollectionType = "Gameboard" | "Topic" | "Master Mathematics";
export interface PageNavigation {
    collectionType?: CollectionType;
    breadcrumbHistory: LinkInfo[];
    backToCollection?: LinkInfo;
    nextItem?: LinkInfo;
    previousItem?: LinkInfo;
    queryParams?: string;
    creationContext?: AudienceContext;
}

const defaultPageNavigation = {breadcrumbHistory: []};

export const useNavigation = (doc: ContentDTO|NOT_FOUND_TYPE|null): PageNavigation => {
    const location = useLocation();
    const currentDocId = doc && doc !== NOT_FOUND ? doc.id as string : "";
    const queryParams = queryString.parse(location.search);
    const dispatch = useAppDispatch();
    const [ loadGameboard ] = isaacApi.endpoints.getGameboardById.useLazyQuery();

    useEffect(() => {
        if (queryParams.board) loadGameboard(queryParams.board as string);
        if (queryParams.topic) dispatch(fetchTopicSummary(queryParams.topic as TAG_ID));
    }, [queryParams.board, queryParams.topic, currentDocId, loadGameboard, dispatch]);

    const currentGameboard = useAppSelector(selectors.board.currentGameboard);
    const currentTopic = useAppSelector(selectors.topic.currentTopic);
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserContext();

    if (doc === null || doc === NOT_FOUND) {
        return defaultPageNavigation;
    }

    if (doc.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION && fastTrackProgressEnabledBoards.includes(currentGameboard?.id || "")) {
        const gameboardHistory = (currentGameboard && queryParams.board === currentGameboard.id) ?
            determineGameboardHistory(currentGameboard) :
            [];
        const questionHistoryList = (queryParams.questionHistory as string || "").split(",");
        const previousQuestion = questionHistoryList.pop();
        const questionHistory = questionHistoryList.length ? questionHistoryList.join(",") : undefined;
        const board = currentGameboard?.id;
        return {
            collectionType: "Master Mathematics",
            breadcrumbHistory: gameboardHistory,
            backToCollection: currentGameboard ? {title: "Return to Top 10 Questions", to: `/gameboards#${currentGameboard.id}`} : undefined,
            nextItem: !previousQuestion ? determineNextGameboardItem(currentGameboard, currentDocId) : undefined,
            previousItem: previousQuestion ? {title: "Return to Previous Question", to: `/questions/${previousQuestion}`} : undefined,
            queryParams: queryString.stringify(previousQuestion ? {board, questionHistory} : {board}),
        };
    }

    if (queryParams.board) {
        const gameboardHistory = (currentGameboard && queryParams.board === currentGameboard.id) ?
            determineGameboardHistory(currentGameboard) :
            [];
        return {
            collectionType: "Gameboard",
            breadcrumbHistory: gameboardHistory,
            backToCollection: gameboardHistory.slice(-1)[0],
            nextItem: determineNextGameboardItem(currentGameboard, currentDocId),
            previousItem: determinePreviousGameboardItem(currentGameboard, currentDocId),
            queryParams: location.search,
            creationContext: determineCurrentCreationContext(currentGameboard, currentDocId),
        }
    }

    if (queryParams.topic) {
        const topicHistory = (currentTopic &&  queryParams.topic === currentTopic?.id?.slice("topic_summary_".length)) ?
            determineTopicHistory(currentTopic, currentDocId) :
            makeAttemptAtTopicHistory();
        return {
            collectionType: "Topic",
            breadcrumbHistory: topicHistory,
            backToCollection: topicHistory.slice(-1)[0],
            nextItem: determineNextTopicContentLink(currentTopic, currentDocId, userContext, user),
            queryParams: location.search,
        }
    }

    return defaultPageNavigation;
};

export const ifKeyIsEnter = (action: () => void) => (event: React.KeyboardEvent) => {
    if (event.keyCode === 13 || event.charCode === 13) {
        action();
    }
};

export const isAppLink = (path: string): boolean => {
    // Paths within the app begin with a "/"
    return path.indexOf("/") === 0;
}

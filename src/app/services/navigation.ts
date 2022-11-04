import React from "react";
import queryString from "query-string";
import {isaacApi, selectors, useAppSelector} from "../state";
import {
    determineCurrentCreationContext,
    determineGameboardHistory,
    determineNextGameboardItem,
    determineNextTopicContentLink,
    determinePreviousGameboardItem,
    determineTopicHistory,
    DOCUMENT_TYPE,
    fastTrackProgressEnabledBoards,
    isFound,
    makeAttemptAtTopicHistory,
    TAG_ID,
    useQueryParams,
    useUserContext
} from "./";
import {AudienceContext, ContentDTO, GameboardDTO} from "../../IsaacApiTypes";
import {NOT_FOUND_TYPE} from "../../IsaacAppTypes";
import {skipToken} from "@reduxjs/toolkit/query";
import {useLocation} from "react-router-dom";

export interface LinkInfo {title: string; to?: string; replace?: boolean}
export type CollectionType = "Gameboard" | "Topic" | "Master Mathematics";
export interface PageNavigation {
    collectionType?: CollectionType;
    breadcrumbHistory: LinkInfo[];
    backToCollection?: LinkInfo;
    nextItem?: LinkInfo;
    previousItem?: LinkInfo;
    search?: string;
    creationContext?: AudienceContext;
    currentGameboard?: GameboardDTO;
}

const defaultPageNavigation = (currentGameboard?: GameboardDTO) => ({breadcrumbHistory: [], currentGameboard});

export const useNavigation = (doc: ContentDTO | NOT_FOUND_TYPE | undefined | null): PageNavigation => {
    const {search} = useLocation();
    const {board: gameboardId, topic, questionHistory} = useQueryParams(true);
    const currentDocId = isFound(doc) ? doc.id as string : "";

    const {data: currentGameboard} = isaacApi.endpoints.getGameboardById.useQuery(gameboardId || skipToken);
    const {data: currentTopic} = isaacApi.endpoints.getTopicSummary.useQuery(topic ? topic as TAG_ID : skipToken);

    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserContext();

    if (!isFound(doc)) {
        return defaultPageNavigation(currentGameboard);
    }

    if (doc.type === DOCUMENT_TYPE.FAST_TRACK_QUESTION && fastTrackProgressEnabledBoards.includes(currentGameboard?.id || "")) {
        const gameboardHistory = (currentGameboard && gameboardId === currentGameboard.id) ?
            determineGameboardHistory(currentGameboard) :
            [];
        const questionHistoryList = (questionHistory as string || "").split(",");
        const previousQuestion = questionHistoryList.pop();
        const modifiedQuestionHistory = questionHistoryList.length ? questionHistoryList.join(",") : undefined;
        const board = currentGameboard?.id;
        return {
            collectionType: "Master Mathematics",
            breadcrumbHistory: gameboardHistory,
            backToCollection: currentGameboard ? {title: "Return to Top 10 Questions", to: `/gameboards#${currentGameboard.id}`} : undefined,
            nextItem: !previousQuestion ? determineNextGameboardItem(currentGameboard, currentDocId) : undefined,
            previousItem: previousQuestion ? {title: "Return to Previous Question", to: `/questions/${previousQuestion}`} : undefined,
            search: queryString.stringify(previousQuestion ? {board, modifiedQuestionHistory} : {board}),
            currentGameboard
        };
    }

    if (gameboardId) {
        const gameboardHistory = (currentGameboard && gameboardId === currentGameboard.id) ?
            determineGameboardHistory(currentGameboard) :
            [];
        return {
            collectionType: "Gameboard",
            breadcrumbHistory: gameboardHistory,
            backToCollection: gameboardHistory.slice(-1)[0],
            nextItem: determineNextGameboardItem(currentGameboard, currentDocId),
            previousItem: determinePreviousGameboardItem(currentGameboard, currentDocId),
            search,
            creationContext: determineCurrentCreationContext(currentGameboard, currentDocId),
            currentGameboard
        }
    }

    if (topic) {
        const topicHistory = (currentTopic && topic === currentTopic?.id?.slice("topic_summary_".length)) ?
            determineTopicHistory(currentTopic, currentDocId) :
            makeAttemptAtTopicHistory();
        return {
            collectionType: "Topic",
            breadcrumbHistory: topicHistory,
            backToCollection: topicHistory.slice(-1)[0],
            nextItem: determineNextTopicContentLink(currentTopic, currentDocId, userContext, user),
            search,
            currentGameboard
        }
    }

    return defaultPageNavigation(currentGameboard);
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

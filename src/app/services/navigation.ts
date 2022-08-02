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
import {AudienceContext, ContentDTO, GameboardDTO} from "../../IsaacApiTypes";
import {NOT_FOUND_TYPE} from "../../IsaacAppTypes";
import {selectors} from "../state/selectors";
import {isaacApi} from "../state/slices/api";
import {skipToken} from "@reduxjs/toolkit/query";
import {useQueryParams} from "./reactRouterExtension";
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

export const useNavigation = (doc: ContentDTO | NOT_FOUND_TYPE | null): PageNavigation => {
    const search = useLocation().search;
    const {board: gameboardId, topic, questionHistory} = useQueryParams(true);
    const currentDocId = doc && doc !== NOT_FOUND ? doc.id as string : "";
    const dispatch = useAppDispatch();
    const {data: currentGameboard} = isaacApi.endpoints.getGameboardById.useQuery(gameboardId ?? skipToken);

    useEffect(() => {
        if (topic) dispatch(fetchTopicSummary(topic as TAG_ID));
    }, [topic, currentDocId, dispatch]);

    const currentTopic = useAppSelector(selectors.topic.currentTopic);
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserContext();

    if (doc === null || doc === NOT_FOUND) {
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

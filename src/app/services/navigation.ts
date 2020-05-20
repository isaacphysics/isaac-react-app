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
import {ContentDTO} from "../../IsaacApiTypes";
import {NOT_FOUND_TYPE} from "../../IsaacAppTypes";

export interface LinkInfo {title: string; to?: string}
export type CollectionType = "Gameboard" | "Topic" | "Master Mathematics";
export interface PageNavigation {
    collectionType?: CollectionType;
    breadcrumbHistory: LinkInfo[];
    backToCollection?: LinkInfo;
    nextItem?: LinkInfo;
    previousItem?: LinkInfo;
    queryParams?: string;
}

const defaultPageNavigation = {
    breadcrumbHistory: [],
};

export const useNavigation = (doc: ContentDTO|NOT_FOUND_TYPE|null): PageNavigation => {
    const currentDocId = doc && doc !== NOT_FOUND ? doc.id as string : "";
    const queryParams = queryString.parse(history.location.search);
    const dispatch = useDispatch();

    useEffect(() => {
        if (queryParams.board) dispatch(loadGameboard(queryParams.board as string));
        if (queryParams.topic) dispatch(fetchTopicSummary(queryParams.topic as TAG_ID));
    }, [queryParams.board, queryParams.topic, currentDocId, dispatch]);

    const currentGameboard = useSelector((state: AppState) => state?.currentGameboard);
    const foundGameboard = currentGameboard !== NOT_FOUND ? currentGameboard : null;
    const currentTopic = useSelector((state: AppState) => state?.currentTopic);
    const foundTopic = currentTopic !== NOT_FOUND ? currentTopic : null;
    const examBoard = useCurrentExamBoard();

    if (doc === null || doc === NOT_FOUND) {
        return defaultPageNavigation;
    }

    if (doc.type === "isaacFastTrackQuestionPage") {
        const gameboardHistory = (foundGameboard && queryParams.board === foundGameboard?.id) ?
            determineGameboardHistory(foundGameboard) :
            [];
        const questionHistory = (queryParams.questionHistory as string || "").split(",");
        const previousQuestion = questionHistory.pop();
        return {
            collectionType: "Master Mathematics",
            breadcrumbHistory: gameboardHistory,
            backToCollection: foundGameboard ? {title: "Return to Top 10 Questions", to: `/gameboards#${foundGameboard.id}`} : undefined,
            nextItem: !previousQuestion ? determineNextGameboardItem(currentGameboard, currentDocId) : undefined,
            previousItem: previousQuestion ? {title: "Return to Previous Question", to: `/questions/${previousQuestion}`} : undefined,
            queryParams: queryString.stringify(
                previousQuestion ?
                    {questionHistory: questionHistory.length ? questionHistory.join(",") : undefined, board: foundGameboard?.id} :
                    {board: foundGameboard?.id}
            ),
        };
    }

    if (queryParams.board) {
        const gameboardHistory = (foundGameboard && queryParams.board === foundGameboard.id) ?
            determineGameboardHistory(foundGameboard) :
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
        const topicHistory = (foundTopic &&  queryParams.topic === foundTopic?.id?.slice("topic_summary_".length)) ?
            determineTopicHistory(foundTopic, currentDocId) :
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

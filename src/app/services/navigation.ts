import React, {useEffect} from "react";
import queryString from "query-string";
import {fetchTopicSummary, selectors, useAppDispatch, useAppSelector, useGetGameboardByIdQuery, useGetMyAssignmentsQuery} from "../state";
import {
    determineCurrentCreationContext,
    determineGameboardHistory,
    determineNextGameboardItem,
    determineNextTopicContentLink,
    determinePreviousGameboardItem,
    determineTopicHistory,
    DOCUMENT_TYPE,
    fastTrackProgressEnabledBoards,
    GENERIC_CONCEPT_CRUMB,
    GENERIC_QUESTION_CRUMB,
    HUMAN_STAGES,
    HUMAN_SUBJECTS,
    isDefined,
    isDefinedContext,
    isFound,
    isNotPartiallyLoggedIn,
    isPhy,
    isSingleStageContext,
    makeAttemptAtTopicHistory,
    NOT_FOUND, PATHS, siteSpecific,
    TAG_ID,
    useQueryParams,
} from "./";
import {AudienceContext, ContentDTO, GameboardDTO} from "../../IsaacApiTypes";
import {NOT_FOUND_TYPE, PageContextState} from "../../IsaacAppTypes";
import {skipToken} from "@reduxjs/toolkit/query";
import {useLocation} from "react-router-dom";

export interface LinkInfo {title: string; to?: string; replace?: boolean}
export type CollectionType = "Gameboard" | "Quiz" | "Topic" | "Master Mathematics";
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

const defaultPageNavigation = (doc: ContentDTO | NOT_FOUND_TYPE | null, pageContext: NonNullable<PageContextState> | undefined, currentGameboard?: GameboardDTO) : PageNavigation => {
    if (doc === NOT_FOUND || doc === null) {
        return {breadcrumbHistory: [], currentGameboard};
    }

    if (doc.type && [DOCUMENT_TYPE.QUESTION, DOCUMENT_TYPE.CONCEPT].includes(doc.type as DOCUMENT_TYPE)) {
        // attempt to determine which landing page to return to
        if (isDefinedContext(pageContext) && isSingleStageContext(pageContext)) {
            return {
                breadcrumbHistory: [
                    {
                        title: `${HUMAN_STAGES[pageContext.stage[0]]} ${HUMAN_SUBJECTS[pageContext.subject]}`,
                        to: `/${pageContext.subject}/${pageContext.stage[0]}`,
                        replace: false
                    },
                    {
                        title: doc.type === DOCUMENT_TYPE.QUESTION ? "Questions" : "Concepts",
                        to: `/${pageContext.subject}/${pageContext.stage[0]}/${doc.type === DOCUMENT_TYPE.QUESTION ? "questions" : "concepts"}`,
                        replace: false
                    },
                ],
                currentGameboard,
            }
        }
    }

    let history = [] as LinkInfo[];

    switch (doc.type) {
        case DOCUMENT_TYPE.QUESTION:
            history = [GENERIC_QUESTION_CRUMB];
            break;
        case DOCUMENT_TYPE.CONCEPT:
            history = [GENERIC_CONCEPT_CRUMB];
            break;
    }
    return {breadcrumbHistory: history, currentGameboard};
};

export const useNavigation = (doc: ContentDTO | NOT_FOUND_TYPE | null): PageNavigation => {
    const {search} = useLocation();
    const {board: gameboardId, topic, questionHistory} = useQueryParams(true);
    const currentDocId = doc && doc !== NOT_FOUND ? doc.id as string : "";
    const dispatch = useAppDispatch();
    const {data: currentGameboard} = useGetGameboardByIdQuery(gameboardId || skipToken);

    useEffect(() => {
        if (topic) dispatch(fetchTopicSummary(topic as TAG_ID));
    }, [topic, currentDocId, dispatch]);

    const currentTopic = useAppSelector(selectors.topic.currentTopic);
    const user = useAppSelector(selectors.user.orNull);
    const queryArg = user?.loggedIn && isNotPartiallyLoggedIn(user) ? undefined : skipToken;
    const {data: assignments} = useGetMyAssignmentsQuery(queryArg, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});
    const pageContext = useAppSelector(selectors.pageContext.context);

    if (doc === null || doc === NOT_FOUND) {
        return defaultPageNavigation(doc, pageContext, currentGameboard);
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
            backToCollection: currentGameboard ? {title: "Return to Top 10 Questions", to: `${PATHS.GAMEBOARD}#${currentGameboard.id}`} : undefined,
            nextItem: !previousQuestion ? determineNextGameboardItem(currentGameboard, currentDocId) : undefined,
            previousItem: previousQuestion ? {title: "Return to Previous Question", to: `/questions/${previousQuestion}`} : undefined,
            search: queryString.stringify(previousQuestion ? {board, modifiedQuestionHistory} : {board}),
            currentGameboard
        };
    }

    if (gameboardId) {
        const gameboardHistory : LinkInfo[] = (currentGameboard && gameboardId === currentGameboard.id) ?
            determineGameboardHistory(currentGameboard) :
            [];

        const breadcrumbHistory = isPhy && isDefined(assignments) && isFound(assignments) && (assignments.map(a => a.gameboardId).includes(gameboardId))
            ? [{title: "Assignments", to: "/assignments"}, ...gameboardHistory]
            : gameboardHistory;

        return {
            collectionType: siteSpecific("Gameboard", "Quiz"),
            breadcrumbHistory: breadcrumbHistory,
            backToCollection: gameboardHistory.slice(-1)[0],
            nextItem: determineNextGameboardItem(currentGameboard, currentDocId),
            previousItem: determinePreviousGameboardItem(currentGameboard, currentDocId),
            search,
            creationContext: determineCurrentCreationContext(currentGameboard, currentDocId),
            currentGameboard
        };
    }

    if (topic) {
        const topicHistory = (currentTopic && topic === currentTopic?.id?.slice("topic_summary_".length)) ?
            determineTopicHistory(currentTopic, currentDocId) :
            makeAttemptAtTopicHistory();
        return {
            collectionType: "Topic",
            breadcrumbHistory: topicHistory,
            backToCollection: topicHistory.slice(-1)[0],
            nextItem: determineNextTopicContentLink(currentTopic, currentDocId),
            search,
            currentGameboard
        };
    }

    return defaultPageNavigation(doc, pageContext, currentGameboard);
};

export const ifKeyIsEnter = (action: () => void) => (event: React.KeyboardEvent) => {
    if (event.keyCode === 13 || event.charCode === 13) {
        action();
    }
};

export const isAppLink = (path: string): boolean => {
    // Paths within the app begin with a "/"
    return path.indexOf("/") === 0;
};

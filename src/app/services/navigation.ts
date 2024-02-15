import React, { useEffect } from "react";
import { fetchTopicSummary, isaacApi, selectors, useAppDispatch, useAppSelector } from "../state";
import {
  determineCurrentCreationContext,
  determineGameboardHistory,
  determineNextGameboardItem,
  determineNextTopicContentLink,
  determinePreviousGameboardItem,
  determineTopicHistory,
  makeAttemptAtTopicHistory,
  NOT_FOUND,
  TAG_ID,
  useQueryParams,
  useUserContext,
} from "./";
import { AudienceContext, ContentDTO, GameboardDTO } from "../../IsaacApiTypes";
import { NOT_FOUND_TYPE } from "../../IsaacAppTypes";
import { skipToken } from "@reduxjs/toolkit/query";
import { useLocation } from "react-router-dom";

export interface LinkInfo {
  title: string;
  to?: string;
  replace?: boolean;
}
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

const defaultPageNavigation = (currentGameboard?: GameboardDTO) => ({ breadcrumbHistory: [], currentGameboard });

export const useNavigation = (doc: ContentDTO | NOT_FOUND_TYPE | null): PageNavigation => {
  const { search } = useLocation();
  const { board: gameboardId, topic } = useQueryParams(true);
  const currentDocId = doc && doc !== NOT_FOUND ? (doc.id as string) : "";
  const dispatch = useAppDispatch();
  const { data: currentGameboard } = isaacApi.endpoints.getGameboardById.useQuery(gameboardId || skipToken);

  useEffect(() => {
    if (topic) dispatch(fetchTopicSummary(topic as TAG_ID));
  }, [topic, currentDocId, dispatch]);

  const currentTopic = useAppSelector(selectors.topic.currentTopic);
  const user = useAppSelector(selectors.user.orNull);
  const userContext = useUserContext();

  if (doc === null || doc === NOT_FOUND) {
    return defaultPageNavigation(currentGameboard);
  }

  if (gameboardId) {
    const gameboardHistory =
      currentGameboard && gameboardId === currentGameboard.id ? determineGameboardHistory(currentGameboard) : [];
    return {
      collectionType: "Gameboard",
      breadcrumbHistory: gameboardHistory,
      backToCollection: gameboardHistory.slice(-1)[0],
      nextItem: determineNextGameboardItem(currentGameboard, currentDocId),
      previousItem: determinePreviousGameboardItem(currentGameboard, currentDocId),
      search,
      creationContext: determineCurrentCreationContext(currentGameboard, currentDocId),
      currentGameboard,
    };
  }

  if (topic) {
    const topicHistory =
      currentTopic && topic === currentTopic?.id?.slice("topic_summary_".length)
        ? determineTopicHistory(currentTopic, currentDocId)
        : makeAttemptAtTopicHistory();
    return {
      collectionType: "Topic",
      breadcrumbHistory: topicHistory,
      backToCollection: topicHistory.slice(-1)[0],
      nextItem: determineNextTopicContentLink(currentTopic, currentDocId, userContext, user),
      search,
      currentGameboard,
    };
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
};

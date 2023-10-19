import { Action, UserProgress } from "../../../IsaacAppTypes";
import { ACTION_TYPE } from "../../services";
import { AnsweredQuestionsByDate } from "../../../IsaacApiTypes";

export type MyProgressState = UserProgress | null;
export const myProgress = (myProgress: MyProgressState = null, action: Action) => {
  switch (action.type) {
    case ACTION_TYPE.MY_PROGRESS_RESPONSE_SUCCESS:
      return action.myProgress;
    case ACTION_TYPE.USER_SNAPSHOT_PARTIAL_UPDATE:
      return {
        // update only the snapshot and then potentially only partially
        ...(myProgress || {}),
        userSnapshot: { ...(myProgress?.userSnapshot || {}), ...action.userSnapshot },
      };
    case ACTION_TYPE.USER_SNAPSHOT_RESPONSE_SUCCESS:
      return {
        // update only the snapshot and then potentially only partially
        ...(myProgress || {}),
        userSnapshot: { ...(myProgress?.userSnapshot || {}), ...action.snapshot },
      };
    case ACTION_TYPE.MY_PROGRESS_RESPONSE_FAILURE:
      return null;
    default:
      return myProgress;
  }
};

export type UserProgressState = UserProgress | null;
export const userProgress = (userProgress: UserProgressState = null, action: Action) => {
  switch (action.type) {
    case ACTION_TYPE.USER_PROGRESS_RESPONSE_SUCCESS:
      return action.userProgress;
    // don't want to update the user snapshot when viewing another user's progress, see myProgress
    case ACTION_TYPE.USER_PROGRESS_RESPONSE_FAILURE:
      return null;
    default:
      return userProgress;
  }
};

type MyAnsweredQuestionsByDateState = AnsweredQuestionsByDate | null;
export const myAnsweredQuestionsByDate = (
  myAnsweredQuestionsByDateState: MyAnsweredQuestionsByDateState = null,
  action: Action,
) => {
  switch (action.type) {
    case ACTION_TYPE.MY_QUESTION_ANSWERS_BY_DATE_REQUEST: {
      return null;
    }
    case ACTION_TYPE.MY_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS: {
      return action.myAnsweredQuestionsByDate;
    }
    default: {
      return myAnsweredQuestionsByDateState;
    }
  }
};

type UserAnsweredQuestionsByDateState = AnsweredQuestionsByDate | null;
export const userAnsweredQuestionsByDate = (
  userAnsweredQuestionsByDateState: UserAnsweredQuestionsByDateState = null,
  action: Action,
) => {
  switch (action.type) {
    case ACTION_TYPE.USER_QUESTION_ANSWERS_BY_DATE_REQUEST: {
      return null;
    }
    case ACTION_TYPE.USER_QUESTION_ANSWERS_BY_DATE_RESPONSE_SUCCESS: {
      return action.userAnsweredQuestionsByDate;
    }
    default: {
      return userAnsweredQuestionsByDateState;
    }
  }
};

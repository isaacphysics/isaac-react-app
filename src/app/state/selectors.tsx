import {anonymisationFunctions, anonymiseIfNeededWith, anonymiseListIfNeededWith, AppState, isaacApi} from "./index";
import {KEY, persistence, NOT_FOUND, isDefined} from "../services";
import {QuizAssignmentDTO} from "../../IsaacApiTypes";
import {AppQuizAssignment, NOT_FOUND_TYPE} from "../../IsaacAppTypes";
import { createSelector } from "@reduxjs/toolkit";

export const selectors = {
  events: {
    eventBookings: createSelector(
      [(state: AppState) => (state && state.eventBookings) || []],
      (eventBookings) => eventBookings
    ),
  },
  notifications: {
    notifications: createSelector(
      [(state: AppState) => state?.notifications?.notifications || []],
      (notifications) => notifications
    ),
  },

  toasts: {
    toasts: createSelector(
      [(state: AppState) => state?.toasts || []],
      (toasts) => toasts
    ),
  },

  topic: {
    currentTopic: createSelector(
      [(state: AppState) => state?.currentTopic],
      (currentTopic) => {
        if (currentTopic != null && currentTopic !== NOT_FOUND) {
          return currentTopic;
        }
        return null;
      }
    ),
  },

  boards: {
    boards: (state: AppState) => state?.boards ?? null,
  },

  doc: {
    get: (state: AppState) => state?.doc || null,
  },

  questions: {
    getQuestions: (state: AppState) => state?.questions?.questions,
    allQuestionsAttempted: createSelector(
      [(state: AppState) => state?.questions?.questions],
      (questions) => {
        return !!questions && questions.every((q) => !!q.currentAttempt);
      }
    ),
    anyQuestionPreviouslyAttempted: createSelector(
      [(state: AppState) => state?.questions?.questions],
      (questions) => {
        return !!questions && questions.some((q) => !!q.bestAttempt);
      }
    ),
  },

  segue: {
    contentVersion: (state: AppState) => state?.contentVersion || null,
    versionOrUnknown: (state: AppState) =>
      state?.constants?.segueVersion || "unknown",
    environmentOrUnknown: (state: AppState) =>
      state?.constants?.segueEnvironment || "unknown",
  },

  error: {
    general: createSelector([(state: AppState) => state?.error], (error) => {
      return (error?.type === "generalError" && error.generalError) || null;
    }),
  },

  user: {
    orNull: (state: AppState) => state?.user || null,
    loggedInOrNull: (state: AppState) =>
      (state?.user?.loggedIn && state.user) || null,
    progress: (state: AppState) => state?.myProgress,
    snapshot: (state: AppState) => state?.myProgress?.userSnapshot,
    achievementsRecord: (state: AppState) =>
      state?.myProgress?.userSnapshot?.achievementsRecord,
    answeredQuestionsByDate: (state: AppState) =>
      state?.myAnsweredQuestionsByDate,
    preferences: (state: AppState) => state?.userPreferences,
  },

  mainContentId: {
    orDefault: (state: AppState) => state?.mainContentId || "main",
  },

  teacher: {
    userProgress: (state: AppState) =>
      state?.userProgress &&
      anonymiseIfNeededWith(anonymisationFunctions.userProgress)(
        state.userProgress
      ),
    userAnsweredQuestionsByDate: (state: AppState) =>
      state?.userAnsweredQuestionsByDate,
  },

  admin: {
    userSearch: (state: AppState) => state?.adminUserSearch || null,
    userSchoolLookup: (state: AppState) => state?.userSchoolLookup,
  },

  connections: {
    activeAuthorisations: (state: AppState) =>
      state?.activeAuthorisations &&
      anonymiseIfNeededWith(anonymisationFunctions.activeAuthorisations)(
        state?.activeAuthorisations
      ),
    otherUserAuthorisations: (state: AppState) =>
      state?.otherUserAuthorisations &&
      anonymiseIfNeededWith(anonymisationFunctions.otherUserAuthorisations)(
        state?.otherUserAuthorisations
      ),
    groupMemberships: (state: AppState) =>
      state?.groupMemberships &&
      anonymiseListIfNeededWith(anonymisationFunctions.groupMembershipDetail)(
        state?.groupMemberships
      ),
  },

  quizzes: {
    preview: (state: AppState) => {
      const qp = state?.quizPreview;
      return {
        quiz: qp && "quiz" in qp ? qp.quiz : null,
        error: qp && "error" in qp ? qp.error : null,
      };
    },
    assignedToMe: (state: AppState) => state?.quizAssignedToMe,
    available: (state: AppState) => state?.quizzes?.quizzes,
    assignments: createSelector(
      [(state: AppState) => state?.quizAssignments, (state: AppState) => state],
      (quizAssignments, state) => {
        const anonymiseUsers = persistence.load(KEY.ANONYMISE_USERS);
        if (quizAssignments && anonymiseUsers === "YES") {
          return anonymisationFunctions.assignments(quizAssignments);
        } else {
          return augmentWithGroupNameIfInCache(state, quizAssignments);
        }
      }
    ),
    /* Retrieves the current users most recent attempt at the current quiz being viewed */
    currentQuizAttempt: (state: AppState) => state?.quizAttempt,
    /* Retrieves the quiz attempt for the current student being looked at (this is used to render /test/attempt/feedback/[group id]/[student id]) */
    currentStudentQuizAttempt: (state: AppState) =>
      state?.studentQuizAttempt && "studentAttempt" in state?.studentQuizAttempt
        ? anonymiseIfNeededWith(anonymisationFunctions.quizAttempt)(
            state.studentQuizAttempt
          )
        : state?.studentQuizAttempt,
    assignment: (state: AppState) =>
      state?.quizAssignment &&
      anonymiseIfNeededWith(anonymisationFunctions.assignment)(
        state.quizAssignment
      ),
    attemptedFreelyByMe: (state: AppState) => state?.quizAttemptedFreelyByMe,
  },
};

// TODO make sure this works!!!
function augmentWithGroupNameIfInCache(state: AppState, quizAssignments: QuizAssignmentDTO[] | NOT_FOUND_TYPE | null | undefined): AppQuizAssignment[] | NOT_FOUND_TYPE | undefined | null {
    if (!isDefined(quizAssignments) || quizAssignments === NOT_FOUND) {
        return quizAssignments;
    }
    const {data: activeGroups} = isaacApi.endpoints.getGroups.select(false)(state as any);
    return quizAssignments.map(assignment => {
        const groupName = activeGroups?.find(g => g.id === assignment.groupId)?.groupName;
        return {
            ...assignment,
            groupName,
        };
    });
}

// Important type checking to avoid an awkward bug
interface SelectorsWithNoPropArgs {
    // It is important that the selectors do not use the component's props to filter the results as they can be
    // out-of-date. In some cases this can lead to zombie children.
    // A full explanation can be found here: https://react-redux.js.org/next/api/hooks#stale-props-and-zombie-children
    // We avoid this problem by forcing the selectors to be simple, accepting only the app state as an argument.
    // Filtering using the props can be safely done later during the component's render on useAppSelector(...)'s result.
    [type: string]: {[name: string]: (state: AppState) => unknown};
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectorsWithoutZombies: SelectorsWithNoPropArgs = selectors; // lgtm[js/unused-local-variable] I don't want to lose selectors' type inference

import {isaacApi} from "./baseApi";
import {
    AssignmentStatusDTO,
    ChoiceDTO,
    DetailedQuizSummaryDTO,
    IsaacQuizDTO,
    QuestionValidationResponseDTO,
    QuizAssignmentDTO,
    QuizAttemptDTO,
    QuizAttemptFeedbackDTO,
    QuizSummaryDTO,
    QuizUserFeedbackDTO,
    ResultsWrapper
} from "../../../../IsaacApiTypes";
import {
    anonymisationFunctions,
    anonymiseIfNeededWith,
    anonymiseListIfNeededWith,
    onQueryLifecycleEvents
} from "./utils";
import {Immutable} from "immer";
import {isDefined} from "../../../services";
import i18next from "i18next";

export const quizApi = isaacApi.enhanceEndpoints({
    addTagTypes: ["AvailableQuizList", "QuizzesAssignedToMe", "QuizzesSetByMe", "QuizzesAttemptedFreelyByMe", "QuizAssignment"],
}).injectEndpoints({
    endpoints: (build) => ({

        getAvailableQuizzes: build.query<QuizSummaryDTO[], number>({
            query: (startIndex) => ({
                url: `/quiz/available/${startIndex}`,
            }),
            transformResponse: (response: ResultsWrapper<QuizSummaryDTO>) => response.results ?? [],
            providesTags: ["AvailableQuizList"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.loadAvailableFailed"),
            })
        }),

        getQuizAssignmentsAssignedToMe: build.query<QuizAssignmentDTO[], void>({
            query: () => `/quiz/assignments`,
            providesTags: ["QuizzesAssignedToMe"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.loadAssignedToMeFailed"),
            })
        }),

        getAttemptedFreelyByMe: build.query<QuizAttemptDTO[], void>({
            query: () => `/quiz/free_attempts`,
            providesTags: ["QuizzesAttemptedFreelyByMe"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.loadFreelyAttemptedFailed"),
            })
        }),

        getMyQuizAttemptWithFeedback: build.query<QuizAttemptDTO, number>({
            query: (quizAttemptId) => `/quiz/attempt/${quizAttemptId}/feedback`,
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.loadMyFeedbackFailed"),
            })
        }),

        // Retrieves the quiz attempt for the current student being looked at (this is used to render /test/attempt/feedback/[group id]/[student id])
        getStudentQuizAttemptWithFeedback: build.query<QuizAttemptFeedbackDTO, {quizAssignmentId: number, userId: number}>({
            query: ({quizAssignmentId, userId}) => `/quiz/assignment/${quizAssignmentId}/attempt/${userId}`,
            transformResponse: anonymiseIfNeededWith(anonymisationFunctions.quizAttempt),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.loadStudentFeedbackFailed"),
            })
        }),

        // loadQuizAssignmentFeedback: (quizAssignmentId: number): AxiosPromise<QuizAssignmentDTO> => {
        //     return endpoint.get(`/quiz/assignment/${quizAssignmentId}`);
        // },

        getQuizAssignmentWithFeedback: build.query<QuizAssignmentDTO, number>({
            query: (quizAssignmentId) => `/quiz/assignment/${quizAssignmentId}`,
            providesTags: (result, error, quizAssignmentId) => [{type: "QuizAssignment", id: quizAssignmentId}],
            transformResponse: anonymiseIfNeededWith(anonymisationFunctions.assignment),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.loadAssignmentFeedbackFailed"),
            })
        }),

        getQuizPreview: build.query<IsaacQuizDTO, string>({
            query: (quizId) => `/quiz/${quizId}/preview`,
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.loadPreviewFailed"),
            })
        }),

        getQuizRubric: build.query<DetailedQuizSummaryDTO, string>({
            query: (quizId) => `/quiz/${quizId}/rubric`,
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.loadRubricFailed"),
            })
        }),

        // === Quiz attempt endpoints ===

        // loadQuizAssignmentAttempt: (quizAssignmentId: number): AxiosPromise<QuizAttemptDTO> => {
        //     return endpoint.post(`/quiz/assignment/${quizAssignmentId}/attempt`);
        // },

        startQuizAttempt: build.mutation<QuizAttemptDTO, number>({
            query: (quizAssignmentId) => ({
                url: `/quiz/assignment/${quizAssignmentId}/attempt`,
                method: "POST",
            }),
            invalidatesTags: [], // TODO what does this invalidate?
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.startAttemptFailed"),
            })
        }),

        // loadFreeQuizAttempt: (quizId: string): AxiosPromise<QuizAttemptDTO> => {
        //     return endpoint.post(`/quiz/${quizId}/attempt`);
        // },

        startFreeQuizAttempt: build.mutation<QuizAttemptDTO, string>({
            query: (quizId) => ({
                url: `/quiz/${quizId}/attempt`,
                method: "POST",
            }),
            invalidatesTags: ["QuizzesAttemptedFreelyByMe"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.startFreeAttemptFailed"),
            })
        }),

        // answer: (quizAttemptId: number, questionId: string, attempt: Immutable<ChoiceDTO>): AxiosPromise<QuestionValidationResponseDTO> => {
        //     return endpoint.post(`/quiz/attempt/${quizAttemptId}/answer/${questionId}`, attempt);
        // },

        updateQuizAttempt: build.mutation<QuestionValidationResponseDTO, {quizAttemptId: number, questionId: string, attempt: Immutable<ChoiceDTO>}>({
            query: ({quizAttemptId, questionId, attempt}) => ({
                url: `/quiz/attempt/${quizAttemptId}/answer/${questionId}`,
                method: "POST",
                body: attempt,
            }),
            invalidatesTags: ["QuizzesAttemptedFreelyByMe", "QuizzesAssignedToMe"], // TODO might not actually invalidate this tag...
        }),

        markQuizAttemptAsComplete: build.mutation<QuizAttemptDTO, number>({
            query: (quizAttemptId) => ({
                url: `/quiz/attempt/${quizAttemptId}/complete`,
                method: "POST",
            }),
            invalidatesTags: ["QuizzesAttemptedFreelyByMe", "QuizzesAssignedToMe"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.submitAnswersFailed"),
            })
        }),

        logQuizSectionView: build.mutation<void, {quizAttemptId: number, page: number}>({
            query: ({quizAttemptId, page}) => ({
                url: `/quiz/attempt/${quizAttemptId}/log`,
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `sectionNumber=${page}`
            })
        }),

        // === Quiz assignment management endpoints (for teachers and tutors) ===

        getQuizAssignmentsSetByMe: build.query<QuizAssignmentDTO[], void>({
            query: () => `/quiz/assigned`,
            providesTags: ["QuizzesSetByMe"],
            transformResponse: anonymiseListIfNeededWith(anonymisationFunctions.assignment),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.loadAssignmentsSetByMeFailed"),
            })
        }),

        assignQuiz: build.mutation<AssignmentStatusDTO[], QuizAssignmentDTO[]>({
            query: (assignment) => ({
                url: "/quiz/assign_bulk",
                method: "POST",
                body: assignment,
            }),
            invalidatesTags: ["QuizzesAssignedToMe", "QuizzesSetByMe"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.assign.errorTitle"),
            })
        }),

        updateQuizAssignment: build.mutation<void, {quizAssignmentId: number, update: QuizAssignmentDTO}>({
            query: ({quizAssignmentId, update}) => ({
                url: `/quiz/assignment/${quizAssignmentId}`,
                method: "POST",
                body: update,
            }),
            invalidatesTags: (result, error, {quizAssignmentId}) =>
                ["QuizzesAssignedToMe", "QuizzesSetByMe", {type: "QuizAssignment", id: quizAssignmentId}],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: ({update}) => {
                    if (isDefined(update.quizFeedbackMode)) return i18next.t("common:tests.api.updateFeedbackModeFailed");
                    if (isDefined(update.dueDate)) return i18next.t("common:tests.api.updateDueDateFailed");
                    return i18next.t("common:tests.api.updateAssignmentFailed");
                },
            })
        }),

        cancelQuizAssignment: build.mutation<void, number>({
            query: (quizAssignmentId) => ({
                url: `/quiz/assignment/${quizAssignmentId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["QuizzesAssignedToMe", "QuizzesSetByMe"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.cancelAssignment.errorTitle"),
            })
        }),

        returnQuizToStudent: build.mutation<QuizUserFeedbackDTO, {quizAssignmentId: number, userId: number}>({
            query: ({quizAssignmentId, userId}) => ({
                url: `/quiz/assignment/${quizAssignmentId}/${userId}/incomplete`,
                method: "POST",
            }),
            invalidatesTags: (result, error, {quizAssignmentId}) =>
                ["QuizzesAssignedToMe", "QuizzesSetByMe", {type: "QuizAssignment", id: quizAssignmentId}],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: () => i18next.t("common:tests.api.returnWorkFailed"),
            })
        }),
    })
});

export const {
    useGetAvailableQuizzesQuery,
    useUpdateQuizAttemptMutation,
    useGetQuizAssignmentsSetByMeQuery,
    useLazyGetQuizAssignmentsSetByMeQuery,
    useGetQuizAssignmentWithFeedbackQuery,
    useUpdateQuizAssignmentMutation,
    useReturnQuizToStudentMutation,
    useGetAttemptedFreelyByMeQuery,
    useGetQuizAssignmentsAssignedToMeQuery,
    useLazyGetQuizAssignmentsAssignedToMeQuery,
    useMarkQuizAttemptAsCompleteMutation,
    useGetQuizPreviewQuery,
    useGetQuizRubricQuery,
    useLogQuizSectionViewMutation,
    useGetStudentQuizAttemptWithFeedbackQuery,
    useAssignQuizMutation,
    useCancelQuizAssignmentMutation,
    useGetMyQuizAttemptWithFeedbackQuery
} = quizApi;

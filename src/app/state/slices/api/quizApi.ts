import {isaacApi} from "./baseApi";
import {
    AssignmentFeedbackDTO,
    ChoiceDTO,
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
                errorTitle: "Loading tests failed",
            })
        }),

        getQuizAssignmentsAssignedToMe: build.query<QuizAssignmentDTO[], void>({
            query: () => `/quiz/assignments`,
            providesTags: ["QuizzesAssignedToMe"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading tests assigned to you failed",
            })
        }),

        getAttemptedFreelyByMe: build.query<QuizAttemptDTO[], void>({
            query: () => `/quiz/free_attempts`,
            providesTags: ["QuizzesAttemptedFreelyByMe"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading attempted freely tests failed",
            })
        }),

        getMyQuizAttemptWithFeedback: build.query<QuizAttemptDTO, number>({
            query: (quizAttemptId) => `/quiz/attempt/${quizAttemptId}/feedback`,
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading test feedback failed",
            })
        }),

        // Retrieves the quiz attempt for the current student being looked at (this is used to render /test/attempt/feedback/[group id]/[student id])
        getStudentQuizAttemptWithFeedback: build.query<QuizAttemptFeedbackDTO, {quizAssignmentId: number, userId: number}>({
            query: ({quizAssignmentId, userId}) => `/quiz/assignment/${quizAssignmentId}/attempt/${userId}`,
            transformResponse: anonymiseIfNeededWith(anonymisationFunctions.quizAttempt),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading student test feedback failed",
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
                errorTitle: "Loading test assignment feedback failed",
            })
        }),

        getQuizPreview: build.query<IsaacQuizDTO, string>({
            query: (quizId) => `/quiz/${quizId}/preview`,
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading test preview failed",
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
                errorTitle: "Starting test attempt failed",
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
                errorTitle: "Starting free test attempt failed",
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
                errorTitle: "Failed to submit your test answers",
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
                errorTitle: "Loading test assignments failed",
            })
        }),

        assignQuiz: build.mutation<AssignmentFeedbackDTO[], QuizAssignmentDTO[]>({
            query: (assignment) => ({
                url: "/quiz/assign_bulk",
                method: "POST",
                body: assignment,
            }),
            invalidatesTags: ["QuizzesAssignedToMe", "QuizzesSetByMe"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to assign test",
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
                    if (isDefined(update.quizFeedbackMode)) return "Failed to update test feedback mode";
                    if (isDefined(update.dueDate)) return "Failed to update test due date";
                    return "Failed to update test assignment";
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
                errorTitle: "Cancelling test assignment failed",
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
                errorTitle: "Failed to return work to the student",
            })
        }),
    })
});

export const {
    useGetAvailableQuizzesQuery,
    useUpdateQuizAttemptMutation,
    useGetQuizAssignmentsSetByMeQuery,
    useGetQuizAssignmentWithFeedbackQuery,
    useUpdateQuizAssignmentMutation,
    useReturnQuizToStudentMutation,
    useGetAttemptedFreelyByMeQuery,
    useGetQuizAssignmentsAssignedToMeQuery,
    useMarkQuizAttemptAsCompleteMutation,
    useGetQuizPreviewQuery,
    useLogQuizSectionViewMutation,
    useGetStudentQuizAttemptWithFeedbackQuery,
    useAssignQuizMutation,
    useCancelQuizAssignmentMutation,
    useGetMyQuizAttemptWithFeedbackQuery
} = quizApi;

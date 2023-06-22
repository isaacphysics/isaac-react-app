import {isaacApi} from "./baseApi";
import {QuizAssignmentDTO} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";

export const quizApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getMySetQuizzes: build.query<QuizAssignmentDTO[], void>({
            query: () => ({
                url: "/quiz/assigned",
                method: "GET",
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Loading test assignments failed",
            }),
        })
    })
});
export const {
    useLazyGetMySetQuizzesQuery,
    useGetMySetQuizzesQuery,
} = quizApi;

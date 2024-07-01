import { CanAttemptQuestionTypeDTO } from "../../../../IsaacAppTypes";
import { isaacApi } from "./baseApi";


export const questionsApi = isaacApi.enhanceEndpoints({addTagTypes: ["CanAttemptQuestionType"]}).injectEndpoints({
    endpoints: (build) => ({
        canAttemptQuestionType: build.query<CanAttemptQuestionTypeDTO, string>({
            query: (questionType) => `/questions/${questionType}/can_attempt`,
            providesTags: (_result, _error, questionType) => [{ type: 'CanAttemptQuestionType', id: questionType }]
        })
    })
});

export const {
    useCanAttemptQuestionTypeQuery,
} = questionsApi;


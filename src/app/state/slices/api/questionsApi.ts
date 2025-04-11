import { IsaacQuestionPageDTO } from "../../../../IsaacApiTypes";
import { CanAttemptQuestionTypeDTO } from "../../../../IsaacAppTypes";
import { tags } from "../../../services";
import { docSlice } from "../doc";
import { isaacApi } from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";


export const questionsApi = isaacApi.enhanceEndpoints({addTagTypes: ["CanAttemptQuestionType"]}).injectEndpoints({
    endpoints: (build) => ({
        getQuestion: build.query<IsaacQuestionPageDTO, string>({
            query: (id) => ({
                url: `/pages/questions/${id}`
            }),
            transformResponse: (response: IsaacQuestionPageDTO) => {
                return tags.augmentDocWithSubject(response);
            },
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to load question",
                onQueryStart: (_args, {dispatch}) => {
                    dispatch(docSlice.actions.resetPage());
                },
                onQuerySuccess: (_args, response, {dispatch}) => {
                    dispatch(docSlice.actions.updatePage({ doc: response }));
                }
            }),
        }),
        canAttemptQuestionType: build.query<CanAttemptQuestionTypeDTO, string>({
            query: (questionType) => `/questions/${questionType}/can_attempt`,
            providesTags: (_result, _error, questionType) => [{ type: 'CanAttemptQuestionType', id: questionType }]
        })
    })
});

export const {
    useGetQuestionQuery,
    useCanAttemptQuestionTypeQuery,
} = questionsApi;


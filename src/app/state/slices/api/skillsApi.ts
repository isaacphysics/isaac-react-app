import { AnvilMarkingRequestDTO } from "../../../../IsaacApiTypes";
import {isaacApi} from "./baseApi";

export const skillsApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        postAnswer: build.mutation<void, AnvilMarkingRequestDTO>({
            query: (body: AnvilMarkingRequestDTO) => ({
                url: "skills/app_page_mental_maths_overall/answer",
                method: "POST",
                body
            })
        }),
    })
});

export const { usePostAnswerMutation } = skillsApi;

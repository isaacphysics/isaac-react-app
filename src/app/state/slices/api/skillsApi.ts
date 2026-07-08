import { AnvilMarkingRequestDTO } from "../../../../IsaacApiTypes";
import {isaacApi} from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";

export const skillsApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        postSkillsAnswer: build.mutation<void, { appId: string, body: AnvilMarkingRequestDTO}>({
            query: ({ appId, body }) => ({
                url: `skills/${appId}/answer`,
                method: "POST",
                body,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Couldn't save answer.",
            }),
        }),
    })
});

export const { usePostSkillsAnswerMutation } = skillsApi;

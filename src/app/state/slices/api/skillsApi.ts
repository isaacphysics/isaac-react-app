import { AnvilMarkingRequestDTO, SkillAttemptsByDate } from "../../../../IsaacApiTypes";
import {isaacApi} from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";

export const skillsApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getUserSkillsAttempts: build.query<SkillAttemptsByDate, string>({
            query: (userId: string) => ({
                url: `/skills/attempts/${userId}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to load skills questions",
            }),
        }),
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

export const { useGetUserSkillsAttemptsQuery, usePostSkillsAnswerMutation } = skillsApi;

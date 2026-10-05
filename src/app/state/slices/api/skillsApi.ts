import { AnvilMarkingRequestDTO, SkillAttemptsByDate } from "../../../../IsaacApiTypes";
import {isaacApi} from "./baseApi";
import { onQueryLifecycleEvents } from "./utils";
import i18next from "i18next";

export const skillsApi = isaacApi.injectEndpoints({
    endpoints: (build) => ({
        getUserSkillsAttempts: build.query<SkillAttemptsByDate, string>({
            query: (userId: string) => ({
                url: `/skills/attempts/${userId}`
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:clientError.skills.loadError"),
            }),
        }),
        postSkillsAnswer: build.mutation<void, { appId: string, body: AnvilMarkingRequestDTO}>({
            query: ({ appId, body }) => ({
                url: `skills/${appId}/answer`,
                method: "POST",
                body,
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: i18next.t("common:clientError.skills.saveError"),
            }),
        }),
    })
});

export const { useGetUserSkillsAttemptsQuery, usePostSkillsAnswerMutation } = skillsApi;

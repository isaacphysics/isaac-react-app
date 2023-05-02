import axios, {AxiosPromise} from "axios";
import {
    API_PATH,
    EventStageFilter,
    EventTypeFilter,
    securePadCredentials,
    securePadPasswordReset,
    TAG_ID
} from "./";
import * as ApiTypes from "../../IsaacApiTypes";
import {
    AuthenticationProvider,
    EmailTemplateDTO,
    EventBookingDTO,
    ResultsWrapper,
    TestCaseDTO,
    UserContext
} from "../../IsaacApiTypes";
import * as AppTypes from "../../IsaacAppTypes";
import {
    AdditionalInformation,
    ATTENDANCE,
    Choice,
    Concepts,
    CredentialsAuthDTO,
    EmailUserRoles,
    QuestionSearchQuery,
    QuestionSearchResponse,
    UserPreferencesDTO,
    ValidationUser
} from "../../IsaacAppTypes";
import {handleApiGoneAway, handleServerError} from "../state";
import {EventOverviewFilter} from "../components/elements/panels/EventOverviews";
import {Immutable} from "immer";

export const endpoint = axios.create({
    baseURL: API_PATH,
    withCredentials: true,
});

endpoint.interceptors.response.use((response) => {
    if (response.status >= 500) {
        // eslint-disable-next-line no-console
        console.warn("Uncaught error from API:", response);
    }
    return response;
}, (error) => {
    if (error.response && error.response.status >= 500 && !error.response.data.bypassGenericSiteErrorPage) {
        if (error.response.status == 502) {
            // A '502 Bad Gateway' response means that the API no longer exists:
            handleApiGoneAway();
        } else {
            handleServerError();
        }
        // eslint-disable-next-line no-console
        console.warn("Error from API:", error);
    }
    return Promise.reject(error);
});

export const apiHelper = {
    determineImageUrl: (path: string) => {
        // Check if the image source is a fully qualified link (suggesting it is external to the Isaac site),
        // or else an asset link served by the APP, not the API.
        if ((path.indexOf("http") > -1) || (path.indexOf("/assets/") > -1)) {
            return path;
        } else {
            return API_PATH + "/images/" + path;
        }
    }
};

export const api = {
    search: {
        get: (query: string, types: string | undefined): AxiosPromise<ApiTypes.ResultsWrapper<ApiTypes.ContentSummaryDTO>> => {
            return endpoint.get(`/search`, {params: {query, types}});
        }
    },
    users: {
        getCurrent: (): AxiosPromise<ApiTypes.RegisteredUserDTO> => {
            return endpoint.get(`/users/current_user`);
        },
        getPreferences: (): AxiosPromise<AppTypes.UserPreferencesDTO> => {
            return endpoint.get(`/users/user_preferences`)
        },
        passwordReset: (params: {email: string}) => {
            return endpoint.post(`/users/resetpassword`, params);
        },
        requestEmailVerification(params: {email: string}) {
            return endpoint.post(`/users/verifyemail`, params);
        },
        verifyPasswordReset: (token: string | null) => {
            return endpoint.get(`/users/resetpassword/${token}`)
        },
        handlePasswordReset: (params: {token: string; password: string}) => {
            return endpoint.post(`/users/resetpassword/${params.token}`, securePadPasswordReset({password: params.password}));
        },
        updateCurrent: (registeredUser: Immutable<ValidationUser>, userPreferences: UserPreferencesDTO, passwordCurrent: string | null, registeredUserContexts?: UserContext[])
            :  AxiosPromise<Immutable<ApiTypes.RegisteredUserDTO>> =>
        {
            return endpoint.post(`/users`, {registeredUser, userPreferences, passwordCurrent, registeredUserContexts});
        },
        passwordResetById: (id: number) => {
            return endpoint.post(`/users/${id}/resetpassword`);
        },

        getUserIdSchoolLookup: (userIds: number[]): AxiosPromise<AppTypes.UserSchoolLookup> => {
            return endpoint.get(`/users/school_lookup?user_ids=${userIds.join(",")}`);
        },
        getProgress: (userIdOfInterest = "current_user"): AxiosPromise<AppTypes.UserProgress> => {
            return endpoint.get(`users/${userIdOfInterest}/progress`);
        },
        getSnapshot: (): AxiosPromise<AppTypes.UserSnapshot> => {
            return endpoint.get(`users/current_user/snapshot`);
        }
    },
    authentication: {
        getRedirect: (provider: ApiTypes.AuthenticationProvider): AxiosPromise => {
            return endpoint.get(`/auth/${provider}/authenticate`);
        },
        checkProviderCallback: (provider: ApiTypes.AuthenticationProvider, params: string): AxiosPromise => {
            return endpoint.get(`/auth/${provider}/callback${params}`);
        },
        logout: (): AxiosPromise => {
            return endpoint.post(`/auth/logout`);
        },
        logoutEverywhere: (): AxiosPromise => {
            return endpoint.post(`/auth/logout/everywhere`);
        },
        login: (provider: ApiTypes.AuthenticationProvider, credentials: CredentialsAuthDTO): AxiosPromise<ApiTypes.RegisteredUserDTO> => {
            return endpoint.post(`/auth/${provider}/authenticate`, securePadCredentials(credentials));
        },
        mfaCompleteLogin: (mfaVerificationCode : string, rememberMe: boolean): AxiosPromise => {
            return endpoint.post(`/auth/mfa/challenge`, {mfaVerificationCode: mfaVerificationCode, rememberMe});
        },
        getCurrentUserAuthSettings: (): AxiosPromise<ApiTypes.UserAuthenticationSettingsDTO> => {
            return endpoint.get(`/auth/user_authentication_settings`)
        },
        getSelectedUserAuthSettings: (userId: number): AxiosPromise<ApiTypes.UserAuthenticationSettingsDTO> => {
            return endpoint.get(`/auth/user_authentication_settings/${userId}`)
        },
        linkAccount: (provider: AuthenticationProvider): AxiosPromise => {
            return endpoint.get(`/auth/${provider}/link`)
        },
        unlinkAccount: (provider: AuthenticationProvider): AxiosPromise => {
            return endpoint.delete(`/auth/${provider}/link`);
        },
    },
    email: {
        verify: (params: {userid: string | null; token: string | null}): AxiosPromise => {
            return endpoint.get(`/users/verifyemail/${params.userid}/${params.token}`);
        },
        getTemplateEmail: (contentid: string): AxiosPromise<AppTypes.TemplateEmail> => {
            return endpoint.get(`/email/viewinbrowser/${contentid}`);
        },
        sendAdminEmail: (contentid: string, emailType: string, roles: EmailUserRoles): AxiosPromise => {
            return endpoint.post(`/email/sendemail/${contentid}/${emailType}`, roles);
        },
        sendAdminEmailWithIds: (contentid: string, emailType: string, ids: number[]): AxiosPromise => {
            return endpoint.post(`/email/sendemailwithuserids/${contentid}/${emailType}`, ids);
        },
        sendProvidedEmailWithUserIds: (emailTemplate: EmailTemplateDTO, emailType: string, ids: number[]): AxiosPromise => {
            return endpoint.post(`/email/sendprovidedemailwithuserids/${emailType}`, {userIds: ids, emailTemplate: emailTemplate});
        },
    },
    notifications: {
        get: (): AxiosPromise => {
            return endpoint.get(`/notifications`)
        },
        respond: (id: string, response: string): AxiosPromise => {
            return endpoint.post(`/notifications/${id}/${response}`)
        }
    },
    admin: {
        userSearch: {
            get: (queryParams: {}): AxiosPromise<ApiTypes.UserSummaryForAdminUsersDTO[]> => {
                return endpoint.get(`/admin/users/`, {params: queryParams});
            }
        },
        userGet: {
            get: (userid: number | undefined): AxiosPromise<ApiTypes.RegisteredUserDTO> => {
                return endpoint.get(`/admin/users/${userid}`);
            }
        },
        userDelete: {
            delete: (userid: number | undefined): AxiosPromise => {
                return endpoint.delete(`/admin/users/${userid}`);
            }
        },
        modifyUserRoles: {
            post: (role: ApiTypes.UserRole, userIds: number[]) => {
                return endpoint.post(`/admin/users/change_role/${role}`, userIds);
            }
        },
        modifyUserEmailVerificationStatuses: {
            post: (status: ApiTypes.EmailVerificationStatus, emails: string[]) => {
                return endpoint.post(`/admin/users/change_email_verification_status/${status}/true`, emails);
            }
        },
        getContentErrors: (): AxiosPromise<AppTypes.ContentErrorsResponse> => {
            return endpoint.get(`/admin/content_problems`)
        },
        getSiteStats: (): AxiosPromise<AppTypes.AdminStatsResponse> => {
            return endpoint.get(`/admin/stats`)
        },
        mergeUsers: (targetId: number, sourceId: number) => {
            return endpoint.post(`/admin/users/merge`, {targetId, sourceId})
        }
    },
    authorisations: {
        get: (): AxiosPromise<ApiTypes.UserSummaryWithEmailAddressDTO[]> => {
            return endpoint.get("authorisations");
        },
        adminGet: (userId: number): AxiosPromise<ApiTypes.UserSummaryWithEmailAddressDTO[]> => {
            return endpoint.get(`authorisations/${userId}`);
        },
        getOtherUsers: (): AxiosPromise<ApiTypes.UserSummaryDTO[]> => {
            return endpoint.get("/authorisations/other_users");
        },
        adminGetOtherUsers: (userId: number): AxiosPromise<ApiTypes.UserSummaryDTO[]> => {
            return endpoint.get(`/authorisations/other_users/${userId}`);
        },
        getTokenOwner: (token: string): AxiosPromise<ApiTypes.UserSummaryWithEmailAddressDTO[]> => {
            return endpoint.get(`/authorisations/token/${token}/owner`);
        },
        useToken: (token: string) => {
            return endpoint.post(`/authorisations/use_token/${token}`);
        },
        revoke: (userId: number) => {
            return endpoint.delete(`/authorisations/${userId}`);
        },
        release: (userId: number) => {
            return endpoint.delete(`/authorisations/release/${userId}`);
        },
        releaseAll: () => {
            return endpoint.delete(`/authorisations/release/`);
        }
    },
    glossary: {
        getTerms: (): AxiosPromise<ApiTypes.ResultsWrapper<ApiTypes.GlossaryTermDTO>> => {
            // FIXME: Magic number. This needs to go through pagination with
            // limit and start_index query parameters.
            return endpoint.get('/glossary/terms', {
                params: { limit: 10000 }
            });
        },
        getTermById: (id: string): AxiosPromise<ApiTypes.GlossaryTermDTO> => {
            return endpoint.get(`/glossary/terms/${id}`);
        }
    },
    questions: {
        get: (id: string): AxiosPromise<ApiTypes.IsaacQuestionPageDTO> => {
            return endpoint.get(`/pages/questions/${id}`);
        },
        search: (query: QuestionSearchQuery): AxiosPromise<QuestionSearchResponse> => {
            return endpoint.get(`/pages/questions/`, {
                params: query,
            });
        },
        answer: (id: string, answer: Immutable<ApiTypes.ChoiceDTO>): AxiosPromise<ApiTypes.QuestionValidationResponseDTO> => {
            return endpoint.post(`/questions/${id}/answer`, answer);
        },
        answeredQuestionsByDate: (userId: number | string, fromDate: number, toDate: number, perDay: boolean): AxiosPromise<ApiTypes.AnsweredQuestionsByDate> => {
            return endpoint.get(`/questions/answered_questions/${userId}`, {
                params: {
                    "from_date": fromDate,
                    "to_date": toDate,
                    "per_day": perDay
                }
            })
        },
        testFreeTextQuestion: (userDefinedChoices: Choice[], testCases: TestCaseDTO[]) => {
            return endpoint.post("/questions/test?type=isaacFreeTextQuestion", {userDefinedChoices, testCases});
        },
        generateSpecification: (graphChoice: ApiTypes.GraphChoiceDTO) => {
            return endpoint.post("/questions/generateSpecification", graphChoice);
        }
    },
    concepts: {
        list: (conceptIds?: string, tagIds?: string): AxiosPromise<Concepts> => {
            return endpoint.get('/pages/concepts', {
                params: { limit: 999 , ids: conceptIds, tags: tagIds }
            });
        },
        get: (id: string): AxiosPromise<ApiTypes.IsaacConceptPageDTO> => {
            return endpoint.get(`/pages/concepts/${id}`);
        },
    },
    pages: {
        get: (id: string): AxiosPromise<ApiTypes.IsaacConceptPageDTO> => {
            return endpoint.get(`/pages/${id}`);
        },
    },
    topics: {
        get: (topicName: TAG_ID): AxiosPromise<ApiTypes.IsaacTopicSummaryPageDTO> => {
            return endpoint.get(`/pages/topics/${topicName}`);
        }
    },
    contentVersion: {
        getLiveVersion: (): AxiosPromise<{ liveVersion: string }> => {
            return endpoint.get(`/info/content_versions/live_version`);
        },
        setLiveVersion(version: string): AxiosPromise {
            return endpoint.post(`/admin/live_version/${version}`);
        }
    },
    constants: {
        getUnits: (): AxiosPromise<string[]> => {
            return endpoint.get(`/content/units`);
        },
        getSegueVersion: (): AxiosPromise<{segueVersion: string}> => {
            return endpoint.get(`/info/segue_version`);
        },
        getSegueEnvironment: (): AxiosPromise<{segueEnvironment: string}> => {
            return endpoint.get(`/info/segue_environment`);
        }
    },
    schools: {
        search: (query: string): AxiosPromise<AppTypes.School[]> => {
            return endpoint.get(`/schools/?limit=3&query=${encodeURIComponent(query)}`);
        },
        getByUrn: (urn: string): AxiosPromise<AppTypes.School[]> => {
            return endpoint.get(`/schools/?urn=${encodeURIComponent(urn)}`);
        }
    },
    countries: {
        getCountries: (): AxiosPromise<Record<string, string>> => {
            return endpoint.get(`/countries`);
        },
        getPriorityCountries: (): AxiosPromise<Record<string, string>> => {
            return endpoint.get(`/countries/priority`);
        }
    },
    contactForm: {
        send: (params: {firstName: string; lastName: string; emailAddress: string; subject: string; message: string }): AxiosPromise => {
            return endpoint.post(`/contact/`, params, {});
        }
    },
    events: {
        get: (eventId: string): AxiosPromise<ApiTypes.IsaacEventPageDTO> => {
            return endpoint.get(`/events/${eventId}`);
        },
        getEvents: (
            startIndex: number, eventsPerPage: number, filterEventsByType: EventTypeFilter | null,
            showActiveOnly: boolean, showInactiveOnly: boolean, showBookedOnly: boolean, showReservedOnly: boolean,
            showStageOnly: EventStageFilter | null
        ): AxiosPromise<{results: ApiTypes.IsaacEventPageDTO[]; totalResults: number}> => {
            return endpoint.get(`/events`, {params: {
                start_index: startIndex,
                limit: eventsPerPage,
                show_active_only: showActiveOnly,
                show_inactive_only: showInactiveOnly,
                show_booked_only: showBookedOnly,
                show_reservations_only: showReservedOnly,
                show_stage_only: showStageOnly,
                tags: filterEventsByType
            }});
        },
        getFirstN: (numberOfActiveEvents: number, active: boolean): AxiosPromise<{results: ApiTypes.IsaacEventPageDTO[]; totalResults: number}> => {
            return endpoint.get(`/events`, {params: {
                start_index: 0, limit: numberOfActiveEvents, show_active_only: active,
                show_inactive_only: !active, show_booked_only: false, tags: null
            }});
        },
        getEventOverviews: (eventOverviewFilter: EventOverviewFilter): AxiosPromise<{results: AppTypes.EventOverview[]; totalResults: number}> => {
            const params = {limit: -1, startIndex: 0};
            if (eventOverviewFilter !== EventOverviewFilter["All events"]) {
                Object.assign(params, {filter: eventOverviewFilter})
            }
            return endpoint.get('/events/overview', {params});
        },
        getEventMapData: (
            startIndex: number, eventsPerPage: number, filterEventsByType: EventTypeFilter | null,
            showActiveOnly: boolean, showInactiveOnly: boolean, showBookedOnly: boolean,
            showStageOnly: EventStageFilter | null): AxiosPromise<{results: AppTypes.EventMapData[]; totalResults: number}> => {
            return endpoint.get(`/events/map_data`, {params: {
                start_index: startIndex,
                limit: eventsPerPage,
                show_active_only: showActiveOnly,
                show_inactive_only: showInactiveOnly,
                show_booked_only: showBookedOnly,
                show_stage_only: showStageOnly,
                tags: filterEventsByType
            }});
        }
    },
    eventBookings: {
        bookMyselfOnEvent: (eventId: string, additionalInformation: AdditionalInformation) => {
            return endpoint.post(`/events/${eventId}/bookings`, additionalInformation);
        },
        addMyselfToWaitingList: (eventId: string, additionalInformation: AdditionalInformation) => {
            return endpoint.post(`/events/${eventId}/waiting_list`, additionalInformation);
        },
        cancelMyBooking: (eventId: string) => {
            return endpoint.delete(`/events/${eventId}/bookings/cancel`);
        },
        getEventBookings: (eventId: string): AxiosPromise<EventBookingDTO[]> => {
            return endpoint.get(`/events/${eventId}/bookings`);
        },
        getEventBookingsForGroup: (eventId: string, groupId: number): AxiosPromise<EventBookingDTO[]> => {
            return endpoint.get(`/events/${eventId}/bookings/for_group/${groupId}`);
        },
        getEventBookingsForAllGroups: (eventId: string): AxiosPromise<EventBookingDTO[]> => {
            return endpoint.get(`/events/${eventId}/groups_bookings`);
        },
        bookUserOnEvent: (eventId: string, userId: number, additionalInformation: AdditionalInformation) => {
            return endpoint.post(`/events/${eventId}/bookings/${userId}`, additionalInformation);
        },
        reserveUsersOnEvent: (eventId: string, userIds: number[]) => {
            return endpoint.post(`/events/${eventId}/reservations`, userIds);
        },
        cancelUsersReservationsOnEvent: (eventId: string, userIds: number[]) => {
            return endpoint.post(`/events/${eventId}/reservations/cancel`, userIds);
        },
        resendUserConfirmationEmail: (eventId: string, userId: number) => {
            return endpoint.post(`/events/${eventId}/bookings/${userId}/resend_confirmation`);
        },
        promoteUserBooking: (eventId: string, userId: number) => {
            return endpoint.post(`/events/${eventId}/bookings/${userId}/promote`, {eventId, userId});
        },
        cancelUserBooking: (eventId: string, userId: number) => {
            return endpoint.delete(`/events/${eventId}/bookings/${userId}/cancel`);
        },
        deleteUserBooking: (eventId: string, userId: number) => {
            return endpoint.delete(`/events/${eventId}/bookings/${userId}`);
        },
        recordEventAttendance: (eventId: string, userId: number, attendance: ATTENDANCE) => {
            const attended = attendance === ATTENDANCE.ATTENDED;
            return endpoint.post(`/events/${eventId}/bookings/${userId}/record_attendance?attended=${attended}`);
        },
        getEventBookingCSV: (eventId: string) => {
            return endpoint.get(`/events/${eventId}/bookings/download`);
        }
    },
    logger: {
        log : (eventDetails: object): AxiosPromise<void> => {
            return endpoint.post(`/log`, eventDetails);
        },
    },
    fasttrack: {
        concepts: (gameboardId: string, concept: string, upperQuestionId: string): AxiosPromise<ApiTypes.GameboardItem[]> => {
            return endpoint.get(`/fasttrack/${gameboardId}/concepts`, {params: {concept, "upper_question_id": upperQuestionId}});
        }
    },
    websockets: {
        userAlerts: (): WebSocket => {
            const userAlertsURI = "/user-alerts";
            if (API_PATH.indexOf("http") > -1) {
                // APP and API on separate domains, urlPrefix is full URL:
                return new WebSocket(API_PATH.replace(/^http/, "ws") + userAlertsURI);
            } else {
                // APP and API on same domain, need window.location.origin for full URL:
                return new WebSocket(window.location.origin.replace(/^http/, "ws") + API_PATH + userAlertsURI);
            }
        }
    },
    quizzes: {
        available: (startIndex: number): AxiosPromise<ResultsWrapper<ApiTypes.QuizSummaryDTO>> => {
            return endpoint.get(`/quiz/available/${startIndex}`);
        },
        createQuizAssignment: (assignment: ApiTypes.QuizAssignmentDTO): AxiosPromise<ApiTypes.QuizAssignmentDTO> => {
            return endpoint.post(`/quiz/assignment`, assignment);
        },
        assignments: (): AxiosPromise<ApiTypes.QuizAssignmentDTO[]> => {
            return endpoint.get(`/quiz/assigned`);
        },
        assignedToMe: (): AxiosPromise<ApiTypes.QuizAssignmentDTO[]> => {
            return endpoint.get(`/quiz/assignments`);
        },
        loadQuizAssignmentAttempt: (quizAssignmentId: number): AxiosPromise<ApiTypes.QuizAttemptDTO> => {
            return endpoint.post(`/quiz/assignment/${quizAssignmentId}/attempt`);
        },
        answer: (quizAttemptId: number, questionId: string, attempt: Immutable<ApiTypes.ChoiceDTO>): AxiosPromise<ApiTypes.QuestionValidationResponseDTO> => {
            return endpoint.post(`/quiz/attempt/${quizAttemptId}/answer/${questionId}`, attempt);
        },
        markQuizAttemptAsComplete: (quizAttemptId: number): AxiosPromise<ApiTypes.QuizAttemptDTO> => {
            return endpoint.post(`/quiz/attempt/${quizAttemptId}/complete`);
        },
        loadQuizAttemptFeedback: (quizAttemptId: number): AxiosPromise<ApiTypes.QuizAttemptDTO> => {
            return endpoint.get(`/quiz/attempt/${quizAttemptId}/feedback`);
        },
        loadStudentQuizAttemptFeedback: (quizAssignmentId: number, userId: number): AxiosPromise<ApiTypes.QuizAttemptFeedbackDTO> => {
            return endpoint.get(`/quiz/assignment/${quizAssignmentId}/attempt/${userId}`)
        },
        loadQuizAssignmentFeedback: (quizAssignmentId: number): AxiosPromise<ApiTypes.QuizAssignmentDTO> => {
            return endpoint.get(`/quiz/assignment/${quizAssignmentId}`);
        },
        cancelQuizAssignment: (quizAssignmentId: number): AxiosPromise<never> => {
            return endpoint.delete(`/quiz/assignment/${quizAssignmentId}`);
        },
        loadQuizPreview: (quizId: string): AxiosPromise<ApiTypes.IsaacQuizDTO> => {
            return endpoint.get(`/quiz/${quizId}/preview`);
        },
        loadFreeQuizAttempt: (quizId: string): AxiosPromise<ApiTypes.QuizAttemptDTO> => {
            return endpoint.post(`/quiz/${quizId}/attempt`);
        },
        loadAttemptedFreelyByMe: (): AxiosPromise<ApiTypes.QuizAttemptDTO[]> => {
            return endpoint.get(`/quiz/free_attempts`);
        },
        markQuizAttemptAsIncomplete: (quizAssignmentId: number, userId: number): AxiosPromise<ApiTypes.QuizUserFeedbackDTO> => {
            return endpoint.post(`/quiz/assignment/${quizAssignmentId}/${userId}/incomplete`);
        },
        updateQuizAssignment: (quizAssignmentId: number, update: ApiTypes.QuizAssignmentDTO): AxiosPromise<never> => {
            return endpoint.post(`/quiz/assignment/${quizAssignmentId}`, update);
        },
        logQuizSectionView: (quizAttemptId: number, page: number): AxiosPromise<never> => {
            return endpoint.post(`/quiz/attempt/${quizAttemptId}/log`, `sectionNumber=${page}`, {});
        },
        getQuizAssignmentResultsSummaryCSV: (assignmentId: number) => {
            return endpoint.get(`/quiz/assignment/${assignmentId}/download`);
        }
    },
};

import axios, {AxiosPromise} from "axios";
import {API_PATH, TAG_ID} from "./constants";
import * as ApiTypes from "../../IsaacApiTypes";
import * as AppTypes from "../../IsaacAppTypes";
import {handleApiGoneAway, handleServerError} from "../state/actions";
import {LoggedInUser, UserPreferencesDTO} from "../../IsaacAppTypes";

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
        get: (query: string, types: string): AxiosPromise<ApiTypes.ResultsWrapper<ApiTypes.ContentSummaryDTO>> => {
            return endpoint.get(`/search/` + encodeURIComponent(query),
                {params: {types}});
        }
    },
    users: {
        getCurrent: (): AxiosPromise<ApiTypes.RegisteredUserDTO> => {
            return endpoint.get(`/users/current_user`);
        },
        getPreferences: (): AxiosPromise<AppTypes.UserPreferencesDTO> => {
            return endpoint.get(`/users/user_preferences`)
        },
        passwordReset: (params: {email: string}): AxiosPromise => {
            return endpoint.post(`/users/resetpassword`, params);
        },
        requestEmailVerification(params: {email: string}): AxiosPromise {
            return endpoint.post(`/users/verifyemail`, params);
        },
        verifyPasswordReset: (token: string | null): AxiosPromise => {
            return endpoint.get(`/users/resetpassword/${token}`)
        },
        handlePasswordReset: (params: {token: string | null; password: string | null}): AxiosPromise => {
            return endpoint.post(`/users/resetpassword/${params.token}`, {password: params.password})
        },
        updateCurrent: (params: {registeredUser: LoggedInUser; userPreferences: UserPreferencesDTO; passwordCurrent: string | null}):  AxiosPromise<ApiTypes.RegisteredUserDTO> => {
            return endpoint.post(`/users`, params);
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
        login: (provider: ApiTypes.AuthenticationProvider, params: {email: string; password: string}): AxiosPromise<ApiTypes.RegisteredUserDTO> => {
            return endpoint.post(`/auth/${provider}/authenticate`, params);
        },
        getCurrentUserAuthSettings: (): AxiosPromise<ApiTypes.UserAuthenticationSettingsDTO> => {
            return endpoint.get(`/auth/user_authentication_settings`)
        }
    },
    email: {
        verify: (params: {userid: string | null; token: string | null}): AxiosPromise => {
            return endpoint.get(`/users/verifyemail/${params.userid}/${params.token}`);
        }
    },
    authorisations: {
        get: (): AxiosPromise<ApiTypes.UserSummaryWithEmailAddressDTO[]> => {
            return endpoint.get(`authorisations`);
        },
        getTokenOwner: (token: string): AxiosPromise<ApiTypes.UserSummaryWithEmailAddressDTO[]> => {
            return endpoint.get(`/authorisations/token/${token}/owner`);
        },
        useToken: (token: string) => {
            return endpoint.post(`/authorisations/use_token/${token}`);
        },
        revoke: (userId: number) => {
            return endpoint.delete(`/authorisations/${userId}`);
        }
    },
    groupManagement: {
        getMyMembership: (): AxiosPromise<AppTypes.GroupMembershipDetailDTO[]> => {
            return endpoint.get(`/groups/membership`);
        }
    },
    questions: {
        get: (id: string): AxiosPromise<ApiTypes.IsaacQuestionPageDTO> => {
            return endpoint.get(`/pages/questions/${id}`);
        },
        answer: (id: string, answer: ApiTypes.ChoiceDTO): AxiosPromise<ApiTypes.QuestionValidationResponseDTO> => {
            return endpoint.post(`/questions/${id}/answer`, answer);
        }
    },
    concepts: {
        get: (id: string): AxiosPromise<ApiTypes.IsaacConceptPageDTO> => {
            return endpoint.get(`/pages/concepts/${id}`);
        },
    },
    pages: {
        get: (id: string): AxiosPromise<ApiTypes.IsaacConceptPageDTO> => {
            return endpoint.get(`/pages/${id}`);
        },
    },
    fragments: {
        get: (id: string): AxiosPromise<ApiTypes.IsaacConceptPageDTO> => {
            return endpoint.get(`/pages/fragments/${id}`);
        },
    },
    topics: {
        get: (topicName: TAG_ID): AxiosPromise<ApiTypes.IsaacTopicSummaryPageDTO> => {
            return endpoint.get(`/pages/topics/${topicName}`);
        }
    },
    gameboards: {
        get: (gameboardId: string): AxiosPromise<ApiTypes.GameboardDTO> => {
            return endpoint.get(`/gameboards/${gameboardId}`);
        }
    },
    assignments: {
        getMyAssignments: (): AxiosPromise<ApiTypes.AssignmentDTO[]> => {
            return endpoint.get(`/assignments`);
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
            return endpoint.get(`/content/units`)
        },
        getSegueVersion: (): AxiosPromise<{segueVersion: string}> => {
            return endpoint.get(`/info/segue_version`)
        }
    },
    schools: {
        search: (query: string): AxiosPromise<Array<AppTypes.School>> => {
            return endpoint.get(`/schools/?query=${encodeURIComponent(query)}`);
        },
        getByUrn: (urn: string): AxiosPromise<Array<AppTypes.School>> => {
            return endpoint.get(`/schools/?urn=${encodeURIComponent(urn)}`);
        }
    },
    contactForm: {
        send: (extra: any, params: {firstName: string; lastName: string; emailAddress: string; subject: string; message: string }): AxiosPromise => {
            return endpoint.post(`/contact/`, params, {});
        }
    }
};

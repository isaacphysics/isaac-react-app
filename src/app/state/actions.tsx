import {api} from "../services/api";
import {Dispatch} from "react";
import {Action} from "../../IsaacAppTypes";
import {ChoiceDTO, QuestionDTO} from "../../IsaacApiTypes";
import {ACTION_TYPES, TOPICS} from "../services/constants";

// User Authentication
export const requestCurrentUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.USER_UPDATE_REQUEST});
    try {
        const currentUser = await api.users.getCurrent();
        dispatch({type: ACTION_TYPES.USER_LOG_IN_RESPONSE_SUCCESS, user: currentUser.data});
    } catch (e) {
        dispatch({type: ACTION_TYPES.USER_UPDATE_FAILURE});
    }
};

export const logOutUser = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.USER_LOG_OUT_REQUEST});
    const response = await api.authentication.logout();
    dispatch({type: ACTION_TYPES.USER_LOG_OUT_RESPONSE_SUCCESS});
    // TODO MT handle error case
};

export const handleProviderLoginRedirect = (provider: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.AUTHENTICATION_REQUEST_REDIRECT, provider});
    const redirectResponse = await api.authentication.getRedirect(provider);
    const redirectUrl = redirectResponse.data.redirectUrl;
    dispatch({type: ACTION_TYPES.AUTHENTICATION_REDIRECT, provider, redirectUrl: redirectUrl});
    window.location.href = redirectUrl;
    // TODO MT handle error case
    // TODO MT handle case when user is already logged in
};

export const handleProviderCallback = (provider: string, parameters: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.AUTHENTICATION_HANDLE_CALLBACK});
    const response = await api.authentication.checkProviderCallback(provider, parameters);
    dispatch({type: ACTION_TYPES.USER_LOG_IN_RESPONSE_SUCCESS, user: response.data});
    // TODO MT trigger user consistency check
    // TODO MT handle error case
};


// Questions
export const fetchQuestion = (questionId: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.DOCUMENT_REQUEST, questionId});
    //const response = await api.questions.get(questionId);
    const response = {data: {"id":"a_toboggan","title":" A Toboggan","type":"isaacQuestionPage","encoding":"markdown","canonicalSourceFile":"content/questions/physics/mechanics/dynamics/level2/a_toboggan.json","layout":"1-col","children":[{"type":"content","encoding":"markdown","children":[],"value":"A toboggan is sliding down a hillside with a uniform acceleration.","published":false,"tags":[]},{"id":"a_toboggan|241e768a-a60a-416b-85b6-66384884db22","type":"isaacMultiChoiceQuestion","encoding":"markdown","children":[],"value":"What is the resultant force acting on the toboggan?","published":true,"hints":[{"type":"content","encoding":"markdown","children":[],"value":"**Concepts**\n\n\\link{Force}{/concepts/cp_force}\n\n\\link{Newton's second law}{/concepts/cp_newtonii}","published":false,"tags":[]},{"type":"content","encoding":"markdown","children":[],"value":"**Goal**\n\nFind the correct statement about the force.\n\n**Information given**\n\nThe toboggan moves with uniform acceleration.","published":false,"tags":[]},{"id":"a_toboggan|241e768a-a60a-416b-85b6-66384884db22|Dynamics_toboggan_2","type":"figure","encoding":"markdown","children":[],"value":"The toboggan slides down the slope at a constant acceleration$\\vtr{a}$ under the effect of a force $\\vtr{F}$","published":true,"src":"content/questions/physics/mechanics/dynamics/level2/figures/Dynamics_toboggan_2.svg","altText":"A toboggan slides down a slope."},{"type":"content","encoding":"markdown","children":[],"value":"**Useful equations**\n\n$\\vtr{F}\\s{res} = m\\vtr{a}$ where $\\vari{\\vtr{F}\\s{res}}$ is the resultant force, $\\vari{m}$ is mass, and $\\vari{\\vtr{a}}$ is acceleration.","published":false,"tags":[]}],"choices":[{"type":"choice","encoding":"markdown","children":[],"value":"It increases uniformly with time.","published":false},{"type":"choice","encoding":"markdown","children":[],"value":"It is zero.","published":false},{"type":"choice","encoding":"markdown","children":[],"value":"It is constant.","published":false},{"type":"choice","encoding":"markdown","children":[],"value":"It decreases uniformly with time.","published":false},{"type":"choice","encoding":"markdown","children":[],"value":"It is proportional to the displacement from a fixed point.","published":false}]}],"attribution":"Adapted with permission from UCLES, A Level Physics, November 1987, Paper 1, Question 1.","relatedContent":[{"id":"cp_newtonii","title":"Newton's Second Law","summary":"The resultant force applied to an object is equal to its rate of change of momentum.","type":"isaacConceptPage","tags":["dynamics","physics","mechanics"],"correct":false},{"id":"falling_masses","title":"Falling Masses","type":"isaacQuestionPage","level":"1","tags":["dynamics","physics","mechanics"],"correct":false},{"id":"rocket_orbit","title":"Rocket in Orbit","type":"isaacQuestionPage","level":"1","tags":["dynamics","physics","mechanics"],"correct":false},{"id":"two_cubes","title":"Two Cubes","type":"isaacQuestionPage","level":"3","tags":["dynamics","physics","mechanics"],"correct":false},{"id":"metal_block_num","title":"A Metal Block","type":"isaacQuestionPage","level":"3","tags":["dynamics","physics","mechanics"],"correct":false,"supersededBy":"metal_block"},{"id":"cp_force","title":"Force","summary":"A force is any influence which tends to change the motion of an object.","type":"isaacConceptPage","tags":["dynamics","physics","mechanics","statics"],"correct":false}],"published":true,"tags":["dynamics","physics","mechanics"],"level":2}}; // TODO MT
    dispatch({type: ACTION_TYPES.DOCUMENT_RESPONSE_SUCCESS, doc: response.data});
    // TODO MT handle response failure
};

export const registerQuestion = (question: QuestionDTO) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.QUESTION_REGISTRATION, question});
};

export const deregisterQuestion = (questionId: string) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.QUESTION_DEREGISTRATION, questionId});
};

export const attemptQuestion = (questionId: string, attempt: ChoiceDTO) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.QUESTION_ATTEMPT_REQUEST, questionId, attempt});
    const response = await api.questions.answer(questionId, attempt);
    dispatch({type: ACTION_TYPES.QUESTION_ATTEMPT_RESPONSE_SUCCESS, questionId, response: response.data});
    // TODO MT handle response failure with a timed canSubmit
};

export const setCurrentAttempt = (questionId: string, attempt: ChoiceDTO) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.QUESTION_SET_CURRENT_ATTEMPT, questionId, attempt});
};


// Topic
export const fetchTopicDetails = (topicName: string) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.TOPIC_REQUEST, topicName});
    try {
        // could check local storage first
        // const topicDetailResponse = await api.topics.get(topicName);
        dispatch({type: ACTION_TYPES.TOPIC_RESPONSE_SUCCESS, topic: TOPICS[topicName]});
    } catch (e) {
        //dispatch({type: ACTION_TYPES.TOPIC_RESPONSE_FAILURE}); // TODO MT handle response failure
    }
};


// Current Gameboard
export const loadGameboard = (gameboardId: string|null) => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.GAMEBOARD_REQUEST, gameboardId});
    // TODO MT handle local storage load if gameboardId == null
    // TODO MT handle requesting new gameboard if local storage is also null
    if (gameboardId) {
        const gameboardResponse = await api.gameboards.get(gameboardId.slice(1));
        dispatch({type: ACTION_TYPES.GAMEBOARD_RESPONSE_SUCCESS, gameboard: gameboardResponse.data});
    }
    // TODO MT handle error case
};


// Assignments
export const loadMyAssignments = () => async (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPES.ASSIGNMENTS_REQUEST});
    const assignmentsResponse = await api.assignments.getMyAssignments();
    dispatch({type: ACTION_TYPES.ASSIGNMENTS_RESPONSE_SUCCESS, assignments: assignmentsResponse.data});
};

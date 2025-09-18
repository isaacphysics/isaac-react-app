import { notificationCheckerMiddleware } from "../../app/state/middleware/notificationManager";
import { ACTION_TYPE } from "../../app/services/constants";
import { openActiveModal } from "../../app/state/actions/popups";
import { policyUpdateModal } from "../../app/components/elements/modals/PolicyUpdateModal";
import { LAST_PRIVACY_POLICY_UPDATE_TIME } from "../../app/components/elements/modals/inequality/constants";
import { jest } from "@jest/globals";
import { Dispatch, AnyAction } from "redux";

describe("notificationCheckerMiddleware - Policy Update Modal", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const createMinimalUser = (privacyPolicyAcceptedTime: string | null = null) => ({
    id: 1,
    givenName: "Test",
    familyName: "User",
    gender: "FEMALE",
    loggedIn: true,
    role: "TUTOR",
    teacherPending: false,
    emailVerificationStatus: "VERIFIED",
    privacyPolicyAcceptedTime,
    registeredContexts: [
      {
        stage: "gcse",
        examBoard: "aqa",
      },
    ],
    registeredContextsLastConfirmed: null,
  });

  const createMinimalState = (user: any, pathname: string = "/home") => ({
    user,
    router: {
      location: {
        pathname,
      },
    },
    userPreferences: {
      EMAIL_PREFERENCE: {
        EVENTS: false,
        NEWS_AND_UPDATES: true,
        ASSIGNMENTS: true,
      },
    },
  });

  const createMiddlewareTest = (user: any, pathname: string = "/home") => {
    const state = createMinimalState(user, pathname);
    const dispatch = jest.fn() as jest.MockedFunction<Dispatch<AnyAction>>;
    const getState = jest.fn().mockReturnValue(state);
    const next = jest.fn() as jest.MockedFunction<Dispatch<AnyAction>>;

    const middleware = notificationCheckerMiddleware({ getState, dispatch });
    const wrappedDispatch = middleware(next);

    return { dispatch, wrappedDispatch, next };
  };

  describe("Policy Update Modal Display Conditions", () => {
    it("should show policy update modal when user has never accepted policy", () => {
      const user = createMinimalUser(null);
      const state = createMinimalState(user);
      const dispatch = jest.fn() as jest.MockedFunction<Dispatch<AnyAction>>;
      const getState = jest.fn().mockReturnValue(state);
      const next = jest.fn() as jest.MockedFunction<Dispatch<AnyAction>>;

      const middleware = notificationCheckerMiddleware({ getState, dispatch });
      console.log("Middleware created:", middleware);

      const wrappedDispatch = middleware(next);
      console.log("Wrapped dispatch created:", wrappedDispatch);

      const action = {
        type: ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS,
        user,
      };

      console.log("Action:", action);
      console.log("About to call wrappedDispatch");

      const result = wrappedDispatch(action);
      console.log("Result from wrappedDispatch:", result);

      jest.runAllTimers();
      console.log("After running timers");

      console.log("Dispatch calls:", dispatch.mock.calls);
      console.log("Next calls:", next.mock.calls);

      expect(next).toHaveBeenCalledWith(openActiveModal(policyUpdateModal));
    });

    it("should show policy update modal when user's accepted time is before the last policy update", () => {
      const oldAcceptedTime = new Date(LAST_PRIVACY_POLICY_UPDATE_TIME - 86400000).toISOString();
      const user = createMinimalUser(oldAcceptedTime);
      const { wrappedDispatch, next } = createMiddlewareTest(user);

      const action = {
        type: ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS,
        user,
      };

      wrappedDispatch(action);
      jest.runAllTimers();

      expect(next).toHaveBeenCalledWith(openActiveModal(policyUpdateModal));
    });

    it("should NOT show policy update modal when user is on privacy policy page", () => {
      const user = createMinimalUser(null);
      const { wrappedDispatch, next } = createMiddlewareTest(user, "/privacy");

      const action = {
        type: ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS,
        user,
      };

      wrappedDispatch(action);
      jest.runAllTimers();

      expect(next).not.toHaveBeenCalledWith(openActiveModal(policyUpdateModal));
    });

    it("should NOT show policy update modal when user has recently accepted the policy", () => {
      const recentAcceptedTime = new Date(LAST_PRIVACY_POLICY_UPDATE_TIME + 86400000).toISOString();
      const user = createMinimalUser(recentAcceptedTime);
      const { wrappedDispatch, next } = createMiddlewareTest(user);

      const action = {
        type: ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS,
        user,
      };

      wrappedDispatch(action);
      jest.runAllTimers();

      expect(next).not.toHaveBeenCalledWith(openActiveModal(policyUpdateModal));
    });

    it("should NOT show policy update modal when user is not logged in", () => {
      const user = { ...createMinimalUser(null), loggedIn: false };
      const { wrappedDispatch, next } = createMiddlewareTest(user);

      const action = {
        type: ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS,
        user,
      };

      wrappedDispatch(action);
      jest.runAllTimers();

      expect(next).not.toHaveBeenCalledWith(openActiveModal(policyUpdateModal));
    });

    it("should NOT show policy update modal for different action types", () => {
      const user = createMinimalUser(null);
      const { wrappedDispatch, next } = createMiddlewareTest(user);

      const action = {
        type: "SOME_OTHER_ACTION",
        user,
      };

      wrappedDispatch(action);
      jest.runAllTimers();

      expect(next).not.toHaveBeenCalledWith(openActiveModal(policyUpdateModal));
    });

    it("should show policy update modal on router page change when user has never accepted policy", () => {
      const user = createMinimalUser(null);
      const { wrappedDispatch, next } = createMiddlewareTest(user);

      const action = {
        type: "routerPageChange",
      };

      wrappedDispatch(action);
      jest.runAllTimers();

      expect(next).toHaveBeenCalledWith(openActiveModal(policyUpdateModal));
    });

    it("should show policy update modal with 1000ms delay", () => {
      const user = createMinimalUser(null);
      const { wrappedDispatch, next } = createMiddlewareTest(user);

      const action = {
        type: ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS,
        user,
      };

      wrappedDispatch(action);

      expect(next).not.toHaveBeenCalledWith(openActiveModal(policyUpdateModal));

      jest.runAllTimers();
      expect(next).toHaveBeenCalledWith(openActiveModal(policyUpdateModal));
    });
  });
});

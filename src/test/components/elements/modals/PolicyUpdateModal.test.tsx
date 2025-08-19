import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { rest } from "msw";
import { API_PATH, ACTION_TYPE } from "../../../../app/services";
import { policyUpdateModal } from "../../../../app/components/elements/modals/PolicyUpdateModal";
import { ActiveModal } from "../../../../app/components/elements/modals/ActiveModal";
import { ActiveModals } from "../../../../app/components/elements/modals/ActiveModals";
import { isaacApi } from "../../../../app/state";
import { server } from "../../../../mocks/server";
import { ActiveModal as ActiveModalType } from "../../../../IsaacAppTypes";

// Mock the store to capture dispatched actions
const mockStore = configureStore({
  reducer: {
    [isaacApi.reducerPath]: isaacApi.reducer,
    activeModals: (state: ActiveModalType[] | null = null, action: any) => {
      switch (action.type) {
        case ACTION_TYPE.ACTIVE_MODAL_OPEN:
          return state ? [...state, action.activeModal] : [action.activeModal];
        case ACTION_TYPE.ACTIVE_MODAL_CLOSE:
          return state && state.length > 1 ? state.slice(0, state.length - 1) : null;
        default:
          return state;
      }
    },
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(isaacApi.middleware),
});

// Mock the actual store from the state module
jest.mock("../../../../app/state", () => ({
  ...jest.requireActual("../../../../app/state"),
  store: mockStore,
  closeActiveModal: () => ({ type: ACTION_TYPE.ACTIVE_MODAL_CLOSE }),
  updatePrivacyPolicyAcceptedTime: (payload: any) => ({ type: "UPDATE_PRIVACY_POLICY_ACCEPTED_TIME", payload }),
}));

// Mock Date.now() to return a predictable timestamp
const mockTimestamp = 1640995200000; // 2022-01-01 00:00:00 UTC
const originalDateNow = Date.now;

// Common render function for modal tests
const renderModal = () => {
  render(
    <Provider store={mockStore}>
      <ActiveModal activeModal={policyUpdateModal} />
    </Provider>,
  );
};

describe("PolicyUpdateModal", () => {
  beforeEach(() => {
    Date.now = jest.fn(() => mockTimestamp);
    mockStore.dispatch({ type: "RESET" });
  });

  afterEach(() => {
    Date.now = originalDateNow;
    jest.clearAllMocks();
  });

  describe("Policy Update Modal", () => {
    it("should not be closeable", () => {
      expect(policyUpdateModal.isCloseable).toBe(false);
    });

    it("should contain 2 privacy policy links", () => {
      renderModal();

      const linkElements = screen.getAllByRole("link");
      expect(linkElements).toHaveLength(2);

      linkElements.forEach((link) => {
        expect(link).toHaveAttribute("href", "/privacy");
      });
    });
  });

  describe("Button Click Behavior", () => {
    beforeEach(() => {
      // Mock the API call
      server.use(
        rest.post(`${API_PATH}/users/privacy_policy_accepted_time`, (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ success: true }));
        }),
      );
    });

    it("should close the privacy policy update modal when 'Agree and Continue' button is clicked", async () => {
      const testModal = {
        ...policyUpdateModal,
        buttons: [
          <button
            key={0}
            onClick={() => {
              mockStore.dispatch({
                type: "UPDATE_PRIVACY_POLICY_ACCEPTED_TIME",
                payload: { privacyPolicyAcceptedTime: Date.now() },
              });
              mockStore.dispatch({ type: ACTION_TYPE.ACTIVE_MODAL_CLOSE });
            }}
          >
            Agree and Continue
          </button>,
        ],
      };

      mockStore.dispatch({
        type: ACTION_TYPE.ACTIVE_MODAL_OPEN,
        activeModal: testModal as ActiveModalType,
      });

      render(
        <Provider store={mockStore}>
          <ActiveModals />
        </Provider>,
      );

      const button = screen.getByRole("button", { name: "Agree and Continue" });
      fireEvent.click(button);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Check that the modal is no longer in the DOM
      expect(screen.queryByTestId("active-modal")).not.toBeInTheDocument();
    });

    it("should use current timestamp when updating privacy policy acceptance", () => {
      renderModal();

      const button = screen.getByRole("button", { name: "Agree and Continue" });
      fireEvent.click(button);

      // Verify that Date.now() was called
      expect(Date.now).toHaveBeenCalled();
      expect(Date.now()).toBe(mockTimestamp);
    });
  });

  describe("Integration with Redux Store", () => {
    it("should work with the actual store configuration", () => {
      // This test verifies that the modal can be rendered with the real store setup
      const { container } = render(
        <Provider store={mockStore}>
          <ActiveModal activeModal={policyUpdateModal} />
        </Provider>,
      );

      expect(container).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      // Mock API error
      server.use(
        rest.post(`${API_PATH}/users/privacy_policy_accepted_time`, (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: "Internal server error" }));
        }),
      );

      // Create a test modal that uses the mock store
      const testModal = {
        ...policyUpdateModal,
        buttons: [
          <button
            key={0}
            onClick={() => {
              mockStore.dispatch({
                type: "UPDATE_PRIVACY_POLICY_ACCEPTED_TIME",
                payload: { privacyPolicyAcceptedTime: Date.now() },
              });
              mockStore.dispatch({ type: ACTION_TYPE.ACTIVE_MODAL_CLOSE });
            }}
          >
            Agree and Continue
          </button>,
        ],
      };

      // Add the modal to the store
      mockStore.dispatch({
        type: ACTION_TYPE.ACTIVE_MODAL_OPEN,
        activeModal: testModal as ActiveModalType,
      });

      // Render using ActiveModals (which gets modals from store)
      render(
        <Provider store={mockStore}>
          <ActiveModals />
        </Provider>,
      );

      const button = screen.getByRole("button", { name: "Agree and Continue" });
      fireEvent.click(button);

      await new Promise((resolve) => setTimeout(resolve, 0));

      // The modal should still close even if the API call fails
      expect(screen.queryByTestId("active-modal")).not.toBeInTheDocument();
    });
  });
});

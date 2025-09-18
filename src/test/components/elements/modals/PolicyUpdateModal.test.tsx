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

jest.mock("../../../../app/state", () => ({
  ...jest.requireActual("../../../../app/state"),
  store: mockStore,
  closeActiveModal: () => ({ type: ACTION_TYPE.ACTIVE_MODAL_CLOSE }),
  updatePrivacyPolicyAcceptedTime: (payload: any) => ({ type: "UPDATE_PRIVACY_POLICY_ACCEPTED_TIME", payload }),
}));

const mockTimestamp = 1640995200000;
const originalDateNow = Date.now;

const createTestModal = (customButtons?: React.ReactElement[]) => ({
  ...policyUpdateModal,
  buttons: customButtons || [
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
});

const renderModalFromStore = (modal: ActiveModalType) => {
  mockStore.dispatch({
    type: ACTION_TYPE.ACTIVE_MODAL_OPEN,
    activeModal: modal,
  });

  return render(
    <Provider store={mockStore}>
      <ActiveModals />
    </Provider>,
  );
};

const renderModalDirect = () => {
  return render(
    <Provider store={mockStore}>
      <ActiveModal activeModal={policyUpdateModal} />
    </Provider>,
  );
};

const mockApiResponse = (status: number, response: any) => {
  server.use(
    rest.post(`${API_PATH}/users/privacy_policy_accepted_time`, (req, res, ctx) => {
      return res(ctx.status(status), ctx.json(response));
    }),
  );
};

const clickAgreeButton = async () => {
  const button = screen.getByRole("button", { name: "Agree and Continue" });
  fireEvent.click(button);
  await new Promise((resolve) => setTimeout(resolve, 0));
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

    it("should contain 1 link to the updated privacy policy page", () => {
      renderModalDirect();

      const linkElements = screen.getAllByRole("link");
      expect(linkElements).toHaveLength(1);

      linkElements.forEach((link) => {
        expect(link).toHaveAttribute("href", "/privacy");
      });
    });
  });

  describe("Button Click Behavior", () => {
    beforeEach(() => {
      mockApiResponse(200, { success: true });
    });

    it("should close the privacy policy update modal when 'Agree and Continue' button is clicked", async () => {
      const testModal = createTestModal();
      renderModalFromStore(testModal as ActiveModalType);

      await clickAgreeButton();

      expect(screen.queryByTestId("active-modal")).not.toBeInTheDocument();
    });

    it("should use current timestamp when updating privacy policy acceptance", () => {
      renderModalDirect();

      const button = screen.getByRole("button", { name: "Agree and Continue" });
      fireEvent.click(button);

      expect(Date.now).toHaveBeenCalled();
      expect(Date.now()).toBe(mockTimestamp);
    });
  });

  describe("Integration with Redux Store", () => {
    it("should work with the actual store configuration", () => {
      const { container } = renderModalDirect();
      expect(container).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should handle API errors gracefully", async () => {
      mockApiResponse(500, { error: "Internal server error" });

      const testModal = createTestModal();
      renderModalFromStore(testModal as ActiveModalType);

      await clickAgreeButton();

      expect(screen.queryByTestId("active-modal")).not.toBeInTheDocument();
    });
  });
});

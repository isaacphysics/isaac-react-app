import { mockNewsPods, mockPromoPods } from "../../../mocks/data";
import { Dashboard } from "../../../app/components/elements/Dashboard";
import { TestUserRole, renderTestEnvironment } from "../../utils";
import { screen, waitFor, within } from "@testing-library/react";
import { IsaacQuestionPageDTO, Role } from "../../../IsaacApiTypes";
import { MockedRequest, RestHandler, rest } from "msw";
import { API_PATH, USER_ROLES } from "../../../app/services";

const mockPromoItem = mockPromoPods.results[0];
const mockFeaturedNewsItem = mockNewsPods.results[1];

const findDashboardButtons = () => {
  const allUserButtons = screen.getByTestId("show-me-buttons");
  const dashboardButtons = within(allUserButtons).getAllByRole("link");
  const teacherButtons = screen.queryByTestId("teacher-dashboard-buttons");
  const teacherDashboardButtons = teacherButtons ? within(teacherButtons).getAllByRole("link") : [];
  return { dashboardButtons, teacherDashboardButtons };
};

const checkDashboardButtons = (role?: "TEACHER") => {
  const { dashboardButtons, teacherDashboardButtons } = findDashboardButtons();

  const expectCommonButtons = () => {
    const commonButtonDetails = [
      { text: "GCSE resources", href: "/topics/gcse" },
      { text: "A Level resources", href: "/topics/a_level" },
      { text: "Events", href: "/events" },
    ];

    commonButtonDetails.forEach(({ text, href }, index) => {
      expect(dashboardButtons[index]).toHaveTextContent(text);
      expect(dashboardButtons[index]).toHaveAttribute("href", href);
    });
  };

  const expectTeacherButtons = () => {
    expect(teacherDashboardButtons).toHaveLength(3);
    const teacherButtonDetails = [
      { text: "Key stage 3 courses", href: "https://teachcomputing.org/courses?level=Key+stage+3" },
      { text: "Key stage 4 courses", href: "https://teachcomputing.org/courses?level=Key+stage+4" },
      { text: "A level courses", href: "https://teachcomputing.org/courses?level=Post+16" },
    ];

    teacherButtonDetails.forEach(({ text, href }, index) => {
      expect(teacherDashboardButtons[index]).toHaveTextContent(text);
      expect(teacherDashboardButtons[index]).toHaveAttribute("href", href);
      const buttonIcon = within(teacherDashboardButtons[index]).getByRole("img");
      expect(buttonIcon).toBeVisible();
    });
  };

  expectCommonButtons();

  if (role === "TEACHER") {
    expectTeacherButtons();
  } else {
    expect(teacherDashboardButtons).toHaveLength(0);
  }
};

describe("Dashboard", () => {
  const setupTest = (
    role: TestUserRole,
    props = {},
    extraEndpoints?: RestHandler<MockedRequest<IsaacQuestionPageDTO[]>>[] | undefined,
  ) => {
    renderTestEnvironment({
      role: role,
      PageComponent: Dashboard,
      componentProps: {
        featuredNewsItem: mockFeaturedNewsItem,
        promoItem: mockPromoItem,
        ...props,
      },
      initialRouteEntries: ["/"],
      extraEndpoints: extraEndpoints,
    });
  };

  it("shows logged out content if no user is logged in", async () => {
    setupTest("ANONYMOUS");
    const loggedOutTitle = await screen.findByRole("heading", {
      name: /The free online textbook for computer science/i,
    });
    expect(loggedOutTitle).toBeInTheDocument();
    const featuredNewsTile = screen.queryByTestId("featured-news-item");
    const promoTile = screen.queryByTestId("promo-tile");
    expect(featuredNewsTile).toBeNull();
    expect(promoTile).toBeNull();
    const joinForFreeButton = screen.getByRole("link", { name: /Join for free!/i });
    expect(joinForFreeButton).toBeInTheDocument();
  });

  it.each(USER_ROLES)("shows the correct dashboard buttons with links for a %s user", async (role) => {
    setupTest(role);
    await screen.findByRole("heading", {
      name: /welcome/i,
    });
    if (role === "TEACHER") checkDashboardButtons("TEACHER");
    else checkDashboardButtons();
  });

  it("shows promo tile and not featured news tile if TEACHER user is logged in and promo item is available", async () => {
    setupTest("TEACHER");
    const promoTile = await screen.findByTestId("promo-tile");
    const featuredNewsTile = screen.queryByTestId("featured-news-item");
    expect(promoTile).toBeInTheDocument();
    expect(featuredNewsTile).toBeNull();
    const promoTitle = screen.getByText(mockPromoItem.title);
    expect(promoTitle).toBeInTheDocument();
  });

  it("shows featured news if TEACHER user is logged in and promo item is not available", async () => {
    setupTest("TEACHER", {
      promoItem: null,
    });
    const featuredNewsTile = await screen.findByTestId("featured-news-item");
    const promoTile = screen.queryByTestId("promo-tile");
    expect(featuredNewsTile).toBeInTheDocument();
    expect(promoTile).toBeNull();
    const featuredNewsTitle = screen.getByText(mockFeaturedNewsItem.title);
    expect(featuredNewsTitle).toBeInTheDocument();
  });

  const nonTeacherOrStudentRoles: Role[] = USER_ROLES.filter((role) => role !== "TEACHER" && role !== "STUDENT");

  it.each(nonTeacherOrStudentRoles)("shows featured news tile if %s user is logged in", async (role) => {
    setupTest(role);
    const promoTile = await screen.findByTestId("promo-tile");
    const featuredNewsTile = screen.queryByTestId("featured-news-item");
    const questionTile = screen.queryByTestId("question-tile");
    expect(promoTile).toBeInTheDocument();
    expect(featuredNewsTile).toBeNull();
    expect(questionTile).toBeNull();
    const promoTitle = screen.getByText(mockPromoItem.title);
    expect(promoTitle).toBeInTheDocument();
  });

  const nonStudentRoles: Role[] = USER_ROLES.filter((role) => role !== "STUDENT");

  it.each(nonStudentRoles)(
    "shows loading spinner for %s users if neither promo item nor featured news item are provided",
    async (role) => {
      setupTest(role, {
        promoItem: null,
        featuredNewsItem: null,
      });
      const featuredNewsTile = await screen.findByTestId("featured-news-item");
      expect(featuredNewsTile).toBeInTheDocument();
      await waitFor(() => {
        const loadingMessage = screen.getByTestId("loading-spinner");
        expect(loadingMessage).toBeVisible();
      });
    },
  );

  it("shows question tile for students if logged in and question data is available", async () => {
    setupTest("STUDENT");
    const questionTile = await screen.findByTestId("question-tile");
    const promoTile = screen.queryByTestId("promo-tile");
    const featuredNewsTile = screen.queryByTestId("featured-news-item");
    expect(questionTile).toBeInTheDocument();
    expect(promoTile).toBeNull();
    expect(featuredNewsTile).toBeNull();
  });

  it("shows featured news instead of question tile for students if no questions comes back from the API", async () => {
    setupTest("STUDENT", {}, [
      rest.get(API_PATH + "/questions/random", (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      }),
    ]);
    const featuredNewsTile = await screen.findByTestId("featured-news-item");
    expect(featuredNewsTile).toBeInTheDocument();
    const questionTile = screen.queryByTestId("question-tile");
    expect(questionTile).toBeNull();
  });
});

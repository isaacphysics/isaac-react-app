import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Container, Row } from "reactstrap";
import { getRandomQuestions, selectors, useAppDispatch, useAppSelector } from "../../state";
import { TeacherPromoItem } from "./TeacherPromoItem";
import { FeaturedNewsItem } from "./FeaturedNewsItem";
import { IsaacPodDTO, IsaacQuestionPageDTO } from "../../../IsaacApiTypes";
import { ShowLoading, defaultPlaceholder } from "../handlers/ShowLoading";
import QuestionCard from "./cards/QuestionCard";
import { isStudent, isTeacher, isTutorOrAbove } from "../../services";

const ShowMeButtons = ({ loggedIn }: { loggedIn: boolean | undefined }) => {
  const showMeButtons = [
    { to: "/topics/gcse", label: "GCSE resources" },
    { to: "/topics/a_level", label: "A Level resources" },
    { to: "/events", label: "Events" },
  ];

  return (
    <Row data-testid="show-me-buttons">
      {showMeButtons.map(({ to, label }) => (
        <Col xs={12} lg={loggedIn ? 12 : 4} className="py-1" key={to}>
          <Button size="lg" tag={Link} to={to} color="secondary" block>
            {label}
          </Button>
        </Col>
      ))}
    </Row>
  );
};

const TeacherButtons = () => {
  const teacherButtons = [
    { to: "https://teachcomputing.org/courses?level=Key+stage+3", label: "Key stage 3 courses" },
    { to: "https://teachcomputing.org/courses?level=Key+stage+4", label: "Key stage 4 courses" },
    { to: "https://teachcomputing.org/courses?level=Post+16", label: "A level courses" },
  ];

  return (
    <div className="py-3">
      <h3>For you</h3>
      <p>
        Browse our National Centre for Computing Education courses to help you teach computing across the secondary
        curriculum.
      </p>
      <Row data-testid="teacher-dashboard-buttons">
        {teacherButtons.map(({ to, label }) => (
          <Col xs={12} className="py-1" key={to}>
            <Button
              size="lg"
              href={to}
              className="teacher-button d-flex justify-content-center align-items-center px-2"
              block
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="flex-grow-1">{label}</span>
              <img src="/assets/new-tab-icon.png" alt="new tab icon" style={{ width: "25px" }} />
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export const Dashboard = ({
  featuredNewsItem,
  promoItem,
}: {
  featuredNewsItem?: IsaacPodDTO | undefined;
  promoItem?: IsaacPodDTO | undefined;
}) => {
  const user = useAppSelector(selectors.user.orNull);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const dispatch = useAppDispatch();
  const questionData = useAppSelector(selectors.questions.randomQuestions);

  useEffect(() => {
    if (user !== null) {
      setLoading(false);
    }
    if (isStudent(user)) {
      dispatch(getRandomQuestions());
    }
  }, [dispatch, user]);

  const PromoOrFeaturedNews = ({ contentType }: { contentType: "promo" | "news" }) => {
    const { dataTestId, className, content } = {
      promo: {
        dataTestId: "promo-tile",
        className: "mt-4 d-block",
        content: <TeacherPromoItem item={promoItem} />,
      },
      news: {
        dataTestId: "featured-news-item",
        className: "d-none d-lg-block",
        content: <FeaturedNewsItem item={featuredNewsItem} />,
      },
    }[contentType];

    return (
      <Col md="12" lg="7" className={className} data-testid={dataTestId}>
        {content}
      </Col>
    );
  };

  const DashboardButtons = ({ className }: { className?: string }) => {
    return (
      <Container id="homepageButtons" className={`${className} ${!user?.loggedIn ? "pt-0 px-lg-0" : ""}`}>
        <h3>{isTeacher(user) ? "For your students" : "Show me"}</h3>
        <ShowMeButtons loggedIn={user?.loggedIn} />
        {isTeacher(user) && <TeacherButtons />}
      </Container>
    );
  };

  const loggedInContent = (
    <Row className="py-4">
      {!expanded && (
        <Col md="12" lg="5" className={"pt-lg-4"}>
          <Container className={"mb-4"}>
            <h1 id="homepageName">Welcome {user?.loggedIn && user.givenName}</h1>
          </Container>
          <DashboardButtons className={"pt-xl-2"} />
        </Col>
      )}
      {isTutorOrAbove(user) ? (
        <PromoOrFeaturedNews contentType={promoItem ? "promo" : "news"} />
      ) : (
        <ShowLoading
          until={questionData}
          thenRender={(questionData: IsaacQuestionPageDTO[]) => (
            <Col md="12" lg={expanded ? "12" : "7"}>
              <QuestionCard setExpanded={setExpanded} questionData={questionData} />
            </Col>
          )}
          ifNotFound={<PromoOrFeaturedNews contentType="news" />}
        />
      )}
    </Row>
  );

  const loggedOutContent = (
    <Row>
      <Col lg="5" className="order-first pb-3">
        <Row>
          <Col>
            <h1>Computer science learning</h1>
            <p className="mt-4">
              Welcome to Isaac Computer Science, the free online platform for students and teachers.
            </p>
            <ul>
              <li>
                Use it in the <strong>classroom</strong>
              </li>
              <li>
                Use it for <strong>homework</strong>
              </li>
              <li>
                Use it for <strong>revision</strong>
              </li>
            </ul>

            <p className="mr-lg-n1">
              {"We also offer free "}
              <Link to="/events">student events</Link>.<br />
              {"Isaac Computer Science is proud to be part of the Department for Education's "}
              <Link to="/teachcomputing">National Centre for Computing Education</Link>.
            </p>
          </Col>
        </Row>
      </Col>
      <Col lg="7" className="order-last order-lg-1 px-lg-5 align-self-center text-center pattern-03">
        <iframe
          title="Isaac Computer Science introduction video"
          width="640"
          height="345"
          className="mw-100 pt-lg-4 no-border"
          src="https://www.youtube-nocookie.com/embed/ci6_Du_NHZA?enablejsapi=1&rel=0&fs=1&modestbranding=1&origin=home"
          allowFullScreen
        />
      </Col>
      <Col className="order-lg-last pb-5 pb-lg-3">
        <DashboardButtons />
      </Col>
    </Row>
  );

  if (loading) {
    return <>{defaultPlaceholder}</>;
  }

  return user?.loggedIn ? loggedInContent : loggedOutContent;
};

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Container, Row } from "reactstrap";
import { selectors, useAppSelector } from "../../state";
import { TeacherPromoItem } from "./TeacherPromoItem";
import { FeaturedNewsItem } from "./FeaturedNewsItem";
import { IsaacPodDTO } from "../../../IsaacApiTypes";
import { defaultPlaceholder } from "../handlers/ShowLoading";

export const Dashboard = ({
  featuredNewsItem,
  promoItem,
}: {
  featuredNewsItem?: IsaacPodDTO | undefined;
  promoItem?: IsaacPodDTO | undefined;
}) => {
  const user = useAppSelector(selectors.user.orNull);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user !== null) {
      setLoading(false);
    }
  }, [user]);

  const PromoOrFeaturedNews = ({
    contentType,
  }: {
    contentType: "promo" | "news";
  }) => {
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

  const ShowMeButtons = ({ className }: { className?: string }) => (
    <Container
      id="homepageButtons"
      className={`${className} ${!user?.loggedIn ? "pt-0 px-lg-0" : ""}`}
    >
      <h3>Show me</h3>
      <Row>
        <Col xs={12} lg={user?.loggedIn ? 12 : 4} className="py-1">
          <Button
            size="lg"
            tag={Link}
            to={"/topics/gcse"}
            color="secondary"
            block
          >
            GCSE resources
          </Button>
        </Col>
        <Col xs={12} lg={user?.loggedIn ? 12 : 4} className="py-1">
          <Button
            size="lg"
            tag={Link}
            to={"/topics/a_level"}
            color="secondary"
            block
          >
            A Level resources
          </Button>
        </Col>
        <Col xs={12} lg={user?.loggedIn ? 12 : 4} className="py-1">
          <Button size="lg" tag={Link} to={"/events"} color="secondary" block>
            Events
          </Button>
        </Col>
      </Row>
    </Container>
  );

  const loggedInContent = (
    <Row className="pt-4">
      <Col md="12" lg="5" className={"pt-lg-4"}>
        <Container className={"mb-4"}>
          <h1 id="homepageName">Welcome {user?.loggedIn && user.givenName}</h1>
        </Container>
        <ShowMeButtons className={"pt-xl-2"} />
        {/*<img id="homepageHeroImg" className="img-fluid" alt="Three Computer Science students studying with two laptops, one with code on the screen" src="/assets/ics_hero.svg" />*/}
      </Col>
      <PromoOrFeaturedNews
        contentType={
          user?.loggedIn && user.role === "TEACHER" && promoItem
            ? "promo"
            : "news"
        }
      />
    </Row>
  );

  const loggedOutContent = (
    <Row>
      <Col lg="5" className="order-first pb-3">
        <Row>
          <Col>
            <h1>Computer science learning</h1>
            <p className="mt-4">
              Welcome to Isaac Computer Science, the free online platform for
              students and teachers.
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
              {
                "Isaac Computer Science is proud to be part of the Department for Education's "
              }
              <Link to="/teachcomputing">
                National Centre for Computing Education
              </Link>
              .
            </p>
          </Col>
        </Row>
      </Col>
      <Col
        lg="7"
        className="order-last order-lg-1 px-lg-5 align-self-center text-center pattern-03"
      >
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
        <ShowMeButtons />
      </Col>
    </Row>
  );

  if (loading) {
    return <>{defaultPlaceholder}</>;
  }

  return user?.loggedIn ? loggedInContent : loggedOutContent;
};

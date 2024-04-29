import React, { useEffect } from "react";
import { useAppSelector, selectors, isaacApi } from "../../state";
import { Link } from "react-router-dom";
import { Button, Col, Container } from "reactstrap";
import { SITE_SUBJECT_TITLE } from "../../services";
import { WhySignUpTabs } from "../elements/WhySignUpTabs";
import { NewsCarousel } from "../elements/NewsCarousel";
import { EventsCarousel } from "../elements/EventsCarousel";
import classNames from "classnames";
import { PromoContent } from "../elements/PromoContent";
import { ShowLoading } from "../handlers/ShowLoading";
import { Dashboard } from "../elements/Dashboard";
import { CareersBanner } from "../elements/CareersBanner";

export const Homepage = () => {
  useEffect(() => {
    document.title = "Isaac " + SITE_SUBJECT_TITLE;
  }, []);

  const user = useAppSelector(selectors.user.orNull);

  const { data: news } = isaacApi.endpoints.getNewsPodList.useQuery({
    subject: "news",
    orderDescending: true,
  });

  const { data: promo } = isaacApi.endpoints.getNewsPodList.useQuery({
    subject: "promo",
    orderDescending: true,
  });

  const [teacherPromoItem, loggedOutPromoItem] = promo
    ? [
        promo.find((item) => item && !item?.id?.includes("public")),
        promo.find((item) => item && item?.id?.includes("public")),
      ]
    : [undefined, undefined];

  const featuredNewsItem = news && user?.loggedIn ? news[0] : undefined;

  const carouselNewsItems = news;

  return (
    <>
      <div id="homepage">
        <section id="call-to-action" className={`homepageHero ${user?.loggedIn ? "pb-lg-4" : ""}`}>
          <Container className="pt-4 z1">
            <Dashboard promoItem={teacherPromoItem} featuredNewsItem={featuredNewsItem} />
          </Container>
        </section>

        {!user?.loggedIn && (
          <>
            <Container>
              <hr />
            </Container>
            <section id="why-sign-up" className="row sign-up-tabs">
              <Container>
                <Col className="pb-5 pt-4 pattern-04">
                  <h2 className="text-center mb-5">Why sign up?</h2>
                  <WhySignUpTabs />
                </Col>
              </Container>
            </section>
          </>
        )}

        <section id="careers" className="banner-primary pattern-05 p-5">
          <CareersBanner />
        </section>

        <section id="news">
          <Container
            className={classNames("pt-4 pb-5", {
              "mt-n4 pt-lg-0": user?.loggedIn ?? false,
            })}
          >
            <div data-testid={"news-carousel"} className="eventList pt-3 pt-md-4 pattern-03-reverse">
              <h2 className="h-title mb-4 pt-lg-3">News</h2>
              <NewsCarousel items={carouselNewsItems} />
            </div>
          </Container>
        </section>

        {!user?.loggedIn && (
          <section id="promo-content" className="row bg-primary pattern-05">
            <ShowLoading
              until={promo}
              thenRender={() => (
                <Container>
                  <Col className="py-5">{loggedOutPromoItem && <PromoContent item={loggedOutPromoItem} />}</Col>
                </Container>
              )}
            />
          </section>
        )}

        <section id="events">
          <Container className="pt-4 pb-5">
            <div className="eventList pt-5 pattern-03">
              <h2 className="h-title text-center mb-4">Events</h2>
              <p className="pt-4 pb-2 event-description text-center col-md-8 offset-md-2">
                {"We offer free online events for students. Visit our "}
                <Link to="/events">Events page</Link>
                {" to see what’s happening, and sign up today!"}
              </p>
              <EventsCarousel />
              <Link to="/events">See all Events</Link>
            </div>
          </Container>
        </section>

        {!user?.loggedIn && (
          <section className="row">
            <Container>
              <Col className="py-4 px-5 mb-5 d-flex align-items-center flex-column flex-md-row border border-dark">
                <h3 className="text-center text-md-left mr-md-4 mr-lg-0 mb-3 mb-md-0">
                  Sign up to track your progress
                </h3>
                <Button tag={Link} size="lg" className="ml-md-auto mr-md-3 mr-lg-5 btn-xl" to={"/register"}>
                  Sign up
                </Button>
              </Col>
            </Container>
          </section>
        )}
      </div>
    </>
  );
};

import React, { useEffect } from "react";
import { useAppSelector, selectors, isaacApi } from "../../state";
import { Link } from "react-router-dom";
import { Button, Col, Container } from "reactstrap";
import { SITE_SUBJECT_TITLE } from "../../services";
import { WhySignUpTabs } from "../elements/WhySignUpTabs";
import { NewsCarousel } from "../elements/NewsCarousel";
import { FeaturedContentTabs } from "../elements/FeaturedContentTabs";
import { EventsCarousel } from "../elements/EventsCarousel";
import { FeaturedNewsItem } from "../elements/FeaturedNewsItem";
import classNames from "classnames";
import { PromoContent } from "../elements/PromoContent";
import { ShowLoading } from "../handlers/ShowLoading";
import { Dashboard } from "../elements/Dashboard";
import { IsaacPodDTO } from "../../../IsaacApiTypes";

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

  const promoItem = promo ? promo[0] : undefined;

  const featuredNewsItem = news && user?.loggedIn ? news[0] : undefined;

  let carouselNewsItems: IsaacPodDTO[] = [];

  if (news) {
    if (
      (user?.loggedIn && user?.role === "TEACHER" && promoItem) ||
      user?.loggedIn === false
    ) {
      carouselNewsItems = news;
    } else {
      carouselNewsItems = news.slice(1);
    }
  }

  return (
    <>
      <div id="homepage">
        <section id="call-to-action" className="homepageHero">
          <Container className="pt-4 z1">
            <Dashboard
              promoItem={promoItem}
              featuredNewsItem={featuredNewsItem}
            />
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
            <section id="promo-content" className="row bg-primary pattern-05">
              <ShowLoading
                until={promo}
                thenRender={() => (
                  <Container>
                    <Col className="py-5">
                      {promoItem && <PromoContent item={promoItem} />}
                    </Col>
                  </Container>
                )}
              />
            </section>
          </>
        )}

        <section id="news">
          <Container
            className={classNames("pt-4 pb-5", {
              "mt-lg-n5 pt-lg-0": user?.loggedIn ?? false,
            })}
          >
            <div
              data-testid={"news-carousel"}
              className="eventList pt-5 pattern-03-reverse"
            >
              <h2 className="h-title mb-4">News</h2>
              {user?.loggedIn && user.role !== "TEACHER" && (
                <div className="d-block d-lg-none mb-4 mb-lg-0">
                  <FeaturedNewsItem item={featuredNewsItem} />
                </div>
              )}
              <NewsCarousel items={carouselNewsItems} />
            </div>
          </Container>
        </section>

        <section id="headline-content" className="row bg-primary pattern-05">
          <Container>
            <Col className="py-5 pb-md-0">
              <FeaturedContentTabs />
            </Col>
          </Container>
        </section>

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
                <Button
                  tag={Link}
                  size="lg"
                  className="ml-md-auto mr-md-3 mr-lg-5 btn-xl"
                  to={"/register"}
                >
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

import React, { useEffect } from "react";
import { SITE_SUBJECT_TITLE } from "../../../services";
import { BreadcrumbTrail } from "../../elements/TitleAndBreadcrumb";
import { Col, Container, Row } from "reactstrap";
import content from "./content";
import "../../../../scss/cs/competition.scss";
import IoECard from "./Section2/IoECard";
import TestimonialComment from "../../elements/TestimonialComment";

const { section1, section2 } = content;

export const IsaacCompetition = () => {
  useEffect(() => {
    document.title = "Isaac " + SITE_SUBJECT_TITLE;
  }, []);

  return (
    <>
      <Container>
        <BreadcrumbTrail currentPageTitle="Isaac Competition" />
      </Container>
      <section id="competition-headline-section">
        <Container className="pt-4 pb-4 z1">
          <Row>
            <h1 className="primary-heading pl-3">National Computer Science Competition</h1>
            <Col xs={12} md={6} lg={8} className="pb-3">
              <p className="mt-4 body-text">{section1.header.section}</p>
              <p className="mt-4 mb-0 body-text">
                <span style={{ fontWeight: 700 }}>{section1.note.heading}</span>
                {` ${section1.note.entryDetails} `}
                <a
                  href={section1.note.xLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                >
                  X
                </a>
                {` and `}
                <a
                  href={section1.note.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-none"
                >
                  Facebook
                </a>
                {` ${section1.note.callToAction}`}
              </p>
            </Col>
            <Col lg={4} md={6} className="order-lg-2 order-3 mt-4 mt-lg-0 pb-md-0">
              <img
                src="/assets/competition-image.png"
                alt="Competition"
                className="img-fluid d-none d-md-block"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Col>
          </Row>
        </Container>
      </section>
      <section id="internetOfEverything" className="event-section">
        <div className="event-section-background-img">
          <Container>
            <Row className="py-4">
              <Col xs={12} lg={6}>
                <IoECard title={section2.ioe.title} content={section2.ioe.section} />
              </Col>
              <Col xs={12} lg={6} className="mt-4 mt-lg-0">
                <IoECard title={section2.examples.title} content={section2.examples.section} isList />
              </Col>
            </Row>
            <div className="pb-4">
              <TestimonialComment imageSrc="/assets/star.svg" altText="Star" text={section2.testamonial.text} />
            </div>
          </Container>
        </div>
      </section>
    </>
  );
};

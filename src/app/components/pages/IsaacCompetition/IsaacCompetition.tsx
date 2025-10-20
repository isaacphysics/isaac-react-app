import React, { useEffect, useRef, useState } from "react";
import { SITE_SUBJECT_TITLE } from "../../../services";
import { BreadcrumbTrail } from "../../elements/TitleAndBreadcrumb";
import { Col, Container, Row } from "reactstrap";
import content from "./content";
import "../../../../scss/cs/competition.scss";
import Accordion from "./Accordion/Accordion";
import InformationCard from "./CompetitionInformation/InformationCard";
import CompetitionTimeline from "./CompetitionInformation/CompetitionTimeline";
import EntryFormHandler from "./EntryForm/EntryFormHandler";

const { section1, section3, accordion } = content;

export const IsaacCompetition = () => {
  useEffect(() => {
    document.title = "Isaac " + SITE_SUBJECT_TITLE;
  }, []);

  const buttons = [
    {
      to: "/login",
      label: "Submit a project",
    },
  ];

  const [open, setOpen] = useState<string | null>(null);

  const setOpenState = (id?: string) => {
    setOpen(id ?? null);
  };

  const accordionRef = useRef<HTMLDivElement>(null);

  const handleTermsClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    event.preventDefault();
    if (accordionRef.current) {
      accordionRef.current.scrollIntoView({ behavior: "smooth" });
      setOpen("5");
    }
  };

  const accordionSections = [
    { id: "0", title: accordion.internetOfEverything.title, section: accordion.internetOfEverything.section },
    { id: "1", title: accordion.projectIdeas.title, section: accordion.projectIdeas.section },
    { id: "2", title: accordion.availableSupport.title, section: accordion.availableSupport.section },
    { id: "3", title: accordion.video.title, section: accordion.video.section },
    { id: "4", title: accordion.groupEntry.title, section: accordion.groupEntry.section },
    { id: "5", title: accordion.assessmentCriteria.title, section: accordion.assessmentCriteria.section },
    { id: "6", title: accordion.industry.title, section: accordion.industry.section },
    { id: "7", title: accordion.termsAndConditions.title, section: accordion.termsAndConditions.section },
  ];

  return (
    <>
      <Container>
        <BreadcrumbTrail currentPageTitle="Isaac Competition" />
      </Container>
      <section id="competition-headline-section">
        <Container className="pt-4 z1">
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
                  className="text-decoration-underline"
                >
                  X
                </a>
                {` and `}
                <a
                  href={section1.note.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-decoration-underline"
                >
                  Facebook
                </a>
                {` ${section1.note.callToAction}`}
              </p>
              <Row className="justify-content-left mt-4"></Row>
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
        <EntryFormHandler buttons={buttons} handleTermsClick={handleTermsClick} />
      </section>
      <section id="internetOfEverything" className="event-section">
        <div className="event-section-background-img">
          {/* <Container>
            <Row className="py-4">
              <Col xs={12} lg={6}>
                <IoECard title={internetOfEverything.ioe.title} content={internetOfEverything.ioe.section} />
              </Col>
              <Col xs={12} lg={6} className="mt-4 mt-lg-0">
                <IoECard
                  title={internetOfEverything.examples.title}
                  content={internetOfEverything.examples.section}
                  isList
                />
              </Col>
            </Row>
            <div className="pb-4">
              <TestimonialComment
                imageSrc="/assets/star.svg"
                altText="Star"
                text={internetOfEverything.testamonial.text}
              />
            </div>
          </Container> */}
        </div>
      </section>

      <section id="competition-information-section">
        <Container className="pt-5 pb-4 z1">
          <Row className="py-4">
            <Col xs={12} lg={6}>
              <InformationCard
                title={section3.howItWorks.title}
                content={section3.howItWorks.steps}
                className="competition-information-default-background"
              />
            </Col>
            <Col xs={12} lg={6} className="mt-4 mt-lg-0">
              <InformationCard
                title={section3.whyJoin.title}
                description={section3.whyJoin.description}
                content={section3.whyJoin.benefits}
                className="competition-information-default-background"
              />
            </Col>
          </Row>
          <Row className="py-4">
            <Col xs={12} lg={6}>
              <InformationCard
                title={section3.eligibility.title}
                content={[section3.eligibility.description, section3.eligibility.requirements]}
                className="competition-information-default-background"
              />
            </Col>
            <Col xs={12} lg={6} className="mt-4 mt-lg-0">
              <InformationCard
                title={section3.prizes.title}
                description={section3.prizes.description}
                content={section3.prizes.prizeList}
                isList
                className="competition-information-prizes-background"
              />
            </Col>
          </Row>
          <CompetitionTimeline
            title={section3.timeline.title}
            content={section3.timeline.content}
            entries={section3.timeline.entries}
          />
        </Container>
      </section>
      <section id="accordion" className="event-section">
        <Container>
          <Row className="py-4">
            <Col>
              <div ref={accordionRef}>
                <Accordion sections={accordionSections} open={open} setOpenState={setOpenState} />
              </div>
            </Col>
          </Row>
        </Container>
      </section>
    </>
  );
};

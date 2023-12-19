import React, { PropsWithChildren } from "react";
import { Col, Container, Row } from "reactstrap";

export interface BannerProps {
  id: string;
  title: string;
  subtitle: string;
  link: string;
  src: string;
  alt?: string;
}

export const Banner = ({ id, title, subtitle, link, src, alt, children }: PropsWithChildren<BannerProps>) => {
  return (
    <section id={id} className="bg-primary pattern-05 p-5">
      <Container>
        <Row className="d-flex align-items-center justify-content-center">
          <button className="button-header btn-lg">{title}</button>
        </Row>
        <Row className="mt-4 d-flex align-items-center justify-content-center">
          <Col xs={12} md={6} lg={5} xl={4} className="d-flex align-items-center justify-content-center">
            <img className="profile-image" src={src} alt={alt || "banner image"} />
          </Col>
          <Col xs={12} md className="pt-3 pl-3" data-testid="banner-description">
            <h5>
              <a href={link} target="_blank" rel="noopener noreferrer">
                <strong>{subtitle}</strong>
              </a>
            </h5>
            {children}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

import React from "react";
import { Card, CardTitle, CardBody, CardText } from "reactstrap";

interface InformationCardProps {
  title: string;
  description?: string;
  content: (string | any)[];
  isList?: boolean;
  className?: string;
  onFaqClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

const InformationCard = ({
  title,
  description,
  content,
  isList = false,
  className = "",
  onFaqClick,
}: InformationCardProps) => {
  const renderStepWithLinks = (step: any, index: number) => (
    <CardText key={index} className="competition-information-text">
      {step.text}
      {step.link1 && (
        <a href={step.link1.href} target="_blank" rel="noopener noreferrer">
          {step.link1.text}
        </a>
      )}
      {step.text2}
      {step.link2 && (
        <a href={step.link2.href} target="_blank" rel="noopener noreferrer" style={{ color: "#1D70B8" }}>
          {step.link2.text}
        </a>
      )}
      {step.text3}
      {step.link3 && (
        <a href={step.link3.href} target="_blank" rel="noopener noreferrer">
          {step.link3.text}
        </a>
      )}
      {step.text4}
      {step.text5}
      {step.link5 && (
        <a
          href={step.link5.href}
          target={step.link5.text === "FAQ guide" ? undefined : "_blank"}
          rel={step.link5.text === "FAQ guide" ? undefined : "noopener noreferrer"}
          onClick={step.link5.text === "FAQ guide" ? onFaqClick : undefined}
        >
          {step.link5.text}
        </a>
      )}
      {step.text6}
    </CardText>
  );

  return (
    <Card className={`h-100 ${className} competition-information-no-border`}>
      <CardTitle tag="h3" className="competition-information-title pt-4 px-4">
        {title}
      </CardTitle>
      <CardBody>
        {description && <CardText className="competition-information-text mb-3">{description}</CardText>}
        {isList ? (
          <ul>
            {content.map((item, index) => {
              const isLast = index === content.length - 1;
              if (item.includes(": ")) {
                const [title, description] = item.split(": ");
                return (
                  <li
                    key={item}
                    className={`competition-information-text ${isLast ? "" : "mb-3"}`}
                    data-title={title + ": "}
                  >
                    {description}
                  </li>
                );
              } else {
                return (
                  <li key={item} className={`competition-information-text ${isLast ? "" : "mb-3"}`}>
                    {item}
                  </li>
                );
              }
            })}
          </ul>
        ) : (
          content.map((item, index) =>
            typeof item === "string" ? (
              <CardText
                key={index}
                className="competition-information-text"
                dangerouslySetInnerHTML={{ __html: item }}
              />
            ) : (
              renderStepWithLinks(item, index)
            ),
          )
        )}
      </CardBody>
    </Card>
  );
};

export default InformationCard;

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
      {step.link1 && <a href={step.link1.href}>{step.link1.text}</a>}
      {step.text2}
      {step.link2 && (
        <a href={step.link2.href} style={{ color: "#1D70B8" }}>
          {step.link2.text}
        </a>
      )}
      {step.text3}
      {step.link3 && <a href={step.link3.href}>{step.link3.text}</a>}
      {step.text4}
      {step.text5}
      {step.link5 && (
        <a href={step.link5.href} onClick={step.link5.text === "FAQ guide" ? onFaqClick : undefined}>
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
              const [title, description] = item.split(": ");
              return (
                <li key={index} className="competition-information-text" data-title={title + ": "}>
                  {description}
                </li>
              );
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

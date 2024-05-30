import React from "react";
import { ContentSummaryDTO } from "../../../../IsaacApiTypes";
import {
  audienceStyle,
  DOCUMENT_TYPE,
  documentTypePathPrefix,
  isIntendedAudience,
  makeIntendedAudienceComparator,
  notRelevantMessage,
  stringifyAudience,
  useUserContext,
} from "../../../services";
import { Link } from "react-router-dom";
import { selectors, useAppSelector } from "../../../state";
import classNames from "classnames";
import { Markup } from "../markup";
import { Button, ListGroup, ListGroupItem, UncontrolledTooltip } from "reactstrap";

export function TopicSummaryLinks({ items, search }: { items: ContentSummaryDTO[]; search?: string }) {
  const userContext = useUserContext();
  const user = useAppSelector(selectors.user.orNull);

  return (
    <ListGroup className="mt-3 link-list list-group-links">
      {items
        // For CS we want relevant sections to appear first
        .sort((itemA, itemB) => {
          return makeIntendedAudienceComparator(user, userContext)(itemA, itemB);
        })

        // Handle conditional display settings
        .map((item) => {
          const intendedAudience = isIntendedAudience(item.audience, userContext, user);
          const showOtherContent = userContext.showOtherContent;
          return { ...item, deEmphasised: !intendedAudience, hidden: !intendedAudience && !showOtherContent };
        })

        // Filter-out hidden items
        .filter((item) => !item.hidden)

        // Render remaining items
        .map((item, index) => (
          <ListGroupItem key={item.id} className="topic-summary-link">
            <Button
              tag={Link}
              to={{ pathname: `/${documentTypePathPrefix[DOCUMENT_TYPE.CONCEPT]}/${item.id}`, search }}
              block
              color="link"
              className={"d-flex align-items-stretch " + classNames({ "de-emphasised": item.deEmphasised })}
            >
              <div
                className={
                  "stage-label badge-primary d-flex align-items-center justify-content-center " +
                  audienceStyle(stringifyAudience(item.audience, userContext))
                }
              >
                {stringifyAudience(item.audience, userContext)}
              </div>
              <div className="title pl-3 d-flex">
                <div className="p-3">
                  <Markup encoding={"latex"}>{item.title}</Markup>
                </div>
                {item.deEmphasised && (
                  <div className="ml-auto mr-3 d-flex align-items-center">
                    <span id={`audience-help-${index}`} className="icon-help mx-1" />
                    <UncontrolledTooltip placement="bottom" target={`audience-help-${index}`}>
                      {`This content has ${notRelevantMessage(userContext)}.`}
                    </UncontrolledTooltip>
                  </div>
                )}
              </div>
            </Button>
          </ListGroupItem>
        ))}
    </ListGroup>
  );
}

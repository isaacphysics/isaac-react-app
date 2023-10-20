import React, { useEffect, useRef, useState } from "react";
import { Carousel, CarouselControl, CarouselIndicators, CarouselItem } from "reactstrap";
import { ifKeyIsEnter } from "../../services";

const ControlledCarouselInstance = ({ children, collectionTag }: any) => {
  const items = children;
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const gotoIndex = (newIndex: any) => {
    if (!animating) {
      setActiveIndex(newIndex);
    }
  };

  const next = () => {
    if (!animating) {
      setActiveIndex(activeIndex + 1);
    }
  };
  useEffect(() => {
    if (activeIndex >= items.length) setActiveIndex(0);
  }, [activeIndex, setActiveIndex]);

  const previous = () => {
    if (!animating) {
      setActiveIndex(activeIndex - 1);
    }
  };
  useEffect(() => {
    if (activeIndex == -1) setActiveIndex(items.length - 1);
  }, [activeIndex, setActiveIndex]);

  const onExiting = () => setAnimating(true);
  const onExited = () => setAnimating(false);
  const onEntered = (element: HTMLElement) => {
    const focusTargets = element.getElementsByClassName("focus-target");
    if (focusTargets.length > 0) {
      (focusTargets[0] as HTMLElement).focus();
    }
  };

  const CollectionTag = collectionTag;

  // Manually set up event listeners until ReactStrap becomes more extensible
  const carouselContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const classToCallback = {
      "carousel-control-prev": ifKeyIsEnter(previous),
      "carousel-control-next": ifKeyIsEnter(next),
    };
    if (carouselContainer.current) {
      for (const [cssClass, callback] of Object.entries(classToCallback)) {
        const elements = carouselContainer.current.getElementsByClassName(cssClass);
        if (elements.length) {
          elements[0].addEventListener("keypress", callback as any);
        }
      }
    }
    return function cleanUp() {
      if (carouselContainer.current) {
        for (const [cssClass, callback] of Object.entries(classToCallback)) {
          const elements = carouselContainer.current.getElementsByClassName(cssClass);
          if (elements.length) {
            elements[0].removeEventListener("keypress", callback as any);
          }
        }
      }
    };
  }, [next, previous]);

  return (
    <div ref={carouselContainer}>
      <Carousel
        activeIndex={activeIndex}
        className="pb-5"
        interval={false}
        keyboard={false}
        previous={previous}
        previousLabel="Previous"
        next={next}
        nextLabel="Next"
      >
        <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
        {children.map((child: any, index: number) => (
          <CarouselItem key={index} onEntered={onEntered as any} onExiting={onExiting} onExited={onExited}>
            <CollectionTag>{child}</CollectionTag>
          </CarouselItem>
        ))}
        <CarouselControl direction="next" directionText="Next" onClickHandler={next} onKeyPress={next} />
        <CarouselIndicators
          items={items.map((item: any, index: number) => ({ key: index }))}
          activeIndex={activeIndex}
          onClickHandler={gotoIndex}
        />
      </Carousel>
    </div>
  );
};

export const ResponsiveCarousel = ({ groupingLimit, children, collectionTag = "div", className }: any) => {
  const tuple: any = [];

  if (!groupingLimit || groupingLimit == 0) {
    groupingLimit = 3;
  }

  children.forEach((child: any, index: number) => {
    if (index % groupingLimit === 0) {
      tuple.push([]);
    }
    tuple[Math.floor(index / groupingLimit)].push(child);
  });

  return (
    <React.Fragment>
      <div className={`d-md-none ${className ?? ""}`}>
        <ControlledCarouselInstance collectionTag={collectionTag}>{children}</ControlledCarouselInstance>
      </div>
      <div data-testid={"carousel-inner"} className={`d-none d-md-block ${className ?? ""}`}>
        <ControlledCarouselInstance collectionTag={collectionTag}>{tuple}</ControlledCarouselInstance>
      </div>
    </React.Fragment>
  );
};
export default ResponsiveCarousel;

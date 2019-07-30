import React, {useState} from 'react';
import {Carousel, CarouselControl, CarouselItem, CarouselIndicators} from 'reactstrap';

const ControlledCarouselInstance = ({children, collectionTag}: any) => {
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
            const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
            setActiveIndex(nextIndex);
        }
    };

    const previous = () => {
        if (!animating) {
            const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
            setActiveIndex(nextIndex);
        }
    };

    const onExiting = () => setAnimating(true);
    const onExited = () => setAnimating(false);
    const onEntered = (element: HTMLElement) => {
        const focusTargets = element.getElementsByClassName('focus-target');
        if (focusTargets.length > 0) {
            // @ts-ignore we should only mark focusable elements with the focus-target class
            focusTargets[0].focus();
        }
    };

    const CollectionTag = collectionTag;

    return (
        <Carousel activeIndex={activeIndex} ride="carousel" className="pb-5" next={next} previous={previous} interval={false}>
            <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
            {children.map ((child: any, index: number) => (
                <CarouselItem key={index} onEntered={onEntered as any} onExiting={onExiting} onExited={onExited}>
                    <CollectionTag>
                        {child}
                    </CollectionTag>
                </CarouselItem>
            ))}
            <CarouselIndicators
                items={items.map((item: any, index: number) => ({key: index}))}
                activeIndex={activeIndex}
                onClickHandler={gotoIndex}
            />
            <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
        </Carousel>
    );
};

export const ResponsiveCarousel = ({children, collectionTag = 'div'}: any) => {
    const triplets: any = [];

    children.forEach((child: any, index: number) => {
        if (index % 3 === 0) {
            triplets.push([]);
        }
        triplets[Math.floor(index / 3)].push (child);
    });

    return (
        <React.Fragment>
            <div className="d-md-none">
                <ControlledCarouselInstance collectionTag={collectionTag}>
                    {children}
                </ControlledCarouselInstance>
            </div>
            <div className="d-none d-md-block">
                <ControlledCarouselInstance collectionTag={collectionTag}>
                    {triplets}
                </ControlledCarouselInstance>
            </div>
        </React.Fragment>
    );
};
export default ResponsiveCarousel;

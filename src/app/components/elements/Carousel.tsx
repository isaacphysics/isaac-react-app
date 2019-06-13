/* eslint-disable */
//ie 11 custom event polyfill
//import 'custom-event-polyfill/polyfill';

import React, {useState} from 'react';
import {
    Carousel,
    CarouselItem,
    CarouselControl,
    CarouselIndicators,
    CarouselCaption,
} from 'reactstrap';

// TODO should be possible to make this more generic
const ControlledCarouselInstance = ({children, collectionTag}: any) => {
    const items = children;
    const [activeIndex, setActiveIndex] = useState (0);
    const [animating, setAnimating] = useState (false);

    // To fulfill mandatory prop
    const keepIndex = () => {
        if (!animating) {
            setActiveIndex (activeIndex);
        }
    };

    const gotoIndex = (newIndex: any) => {
        if (!animating) {
            setActiveIndex (newIndex);
        }
    };
    const onExiting = () => setAnimating (true);
    const onExited = () => setAnimating (false);
    const CollectionTag = collectionTag;

    return (
        <Carousel activeIndex={activeIndex} ride="carousel" className="pb-5" next={keepIndex} previous={keepIndex}>
            {children.map ((child: any, index: number) => (
                <CarouselItem key={index} onExiting={onExiting} onExited={onExited}>
                    <CollectionTag>
                        {child}
                    </CollectionTag>
                </CarouselItem>
            ))}
            <CarouselIndicators
                items={items}
                activeIndex={activeIndex}
                onClickHandler={gotoIndex}
            />
        </Carousel>
    );
};

export const ResponsiveCarousel = ({children, collectionTag = 'div'}: any) => {
    const triplets: any = [];

    children.forEach ((child: any, index: number) => {
        if (index % 3 === 0) {
            triplets.push ([]);
        }
        triplets[Math.floor (index / 3)].push (child);
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

import React from "react";
import {ListGroup, ListGroupItem} from "reactstrap";

export const ListGroupSocial = () => (
    <div className='footer-links footer-links-social'>
        <h5>Get Social</h5>
        <ListGroup className='mt-3 pb-5 py-lg-3 link-list d-md-flex flex-row'>
            <ListGroupItem className='border-0 px-0 py-0 pb-1 bg-transparent'>
                <a href='https://www.facebook.com/IsaacComputerScience/' target='_blank' rel='noopener'>
                    <img src="/assets/facebook_icon.svg" alt='Isaac Computer Science on Facebook' className='logo-mr' />
                </a>
            </ListGroupItem>
            <ListGroupItem className='border-0 px-0 py-0 pb-1 bg-transparent'>
                <a href='https://twitter.com/isaaccompsci' target='_blank' rel='noopener'>
                    <img src="/assets/twitter_icon.svg" alt='Isaac Computer Science on Twitter' className='logo-mr' />
                </a>
            </ListGroupItem>
            <ListGroupItem className='border-0 px-0 py-0 pb-1 bg-transparent'>
                <a href='https://www.instagram.com/isaaccompsci/' target='_blank' rel='noopener'>
                    <img src="/assets/instagram_icon.svg" alt='Isaac Computer Science on Instagram' className='logo-mr' />
                </a>
            </ListGroupItem>
            <ListGroupItem className='border-0 px-0 py-0 pb-1 bg-transparent'>
                <a href='https://www.youtube.com/channel/UC-qoIYj8kgR8RZtQphrRBYQ/' target='_blank' rel='noopener'>
                    <img src="/assets/youtube_icon.svg" alt='Isaac Computer Science on YouTube' className='logo-mr' />
                </a>
            </ListGroupItem>
        </ListGroup>
    </div>
);

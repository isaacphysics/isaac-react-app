import React from 'react';
import {shallow} from 'enzyme';
import {HomePageComponent} from "../../app/components/pages/HomePage";
import {RegisteredUserDTO} from "../../IsaacApiTypes";

describe('HomePageComponent', () => {

    it('renders correctly with a null valued user', () => {
        const component = shallow(<HomePageComponent user={null} />);
        expect(component).toMatchSnapshot();
    });

    it("prints out the user's name when it is provided", () => {
        const user: RegisteredUserDTO = {givenName: "Alan"};
        const component = shallow(<HomePageComponent user={user} />);
        expect(component).toMatchSnapshot();
    })

});

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
import {store} from "../../app/state";
import {IsaacApp} from '../../app/components/navigation/IsaacApp';

jest.mock("react-ga"); // Google Analytics requires a DOM.window which doesn't exist in test

describe('IsaacApp', () => {

    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(<React.StrictMode><Provider store={store}><IsaacApp/></Provider></React.StrictMode>, div);
        ReactDOM.unmountComponentAtNode(div);
    });

});

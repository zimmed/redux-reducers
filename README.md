# Redux-Reducer
Utility library for modular redux reducers.

## Installation

```
npm i --save redux-reducers --registry https://npm-proxy.fury.io/zimmed
```

## Example Usage (simple)

Assuming you have a simple, standard redux application, you can implement the redux-reducers module like the following:

```javascript
// component.js
import React from 'react';
import {createStore} from 'redux';
import {Provider, connect} from 'react-redux';
import AppReducer from './reducer';


const store = createStore(AppReducer);

const App = () => (
    <Provider store={store}>
        <Header />
    </Provider>
);

const Header = connect(state => state)(({name}) => (
    <div id="header">
        Welcome to my application, {name}!
    </div>
);

export default App;
```

```javascript
// reducer.js
import Reducer from 'redux-reducers';


const model = {name: 'Unnamed'};
const actions = {
    changeName: (state, action) => Object.assign({}, state, {name: action.data})
};

export default Reducer.create(model, actions, {});
```

In this simple example, the `reducer.js` file exports a root reducer that handles one action type: `changeName`. And the initial state tree would be: `{name: 'Unnamed'}`. This way you can have a map of reducers to handle all of your actiont types.

In the advanced usage, you will see the real benefit of this structure when we start to add complex actions and branched reducers.

## Example Usage (advanced)

In a redux application, you typically want a nice way to branch your reducers to specific modules without a bunch of `switch` statements. Well, here's how you can do that given the following project structure:

- *src*
    - *actions*
        - index.js
        - some-complex-action.js
    - app.component.js
    - app.model.js
    - app.reducer.js
    - *components*
        - *thing*
            - thing.component.js
            - thing.model.js
            - thing.reducer.js

```javascript
// src/app.reducer.js
import Reducer from 'redux-reducers';
import AppModel from './app.model';
import AppActions from './actions';
import {ThingReducer as thing} from 'components/thing';


export default Reducer.create(AppModel, AppActions, {thing});
```

```javascript
// src/app.model.js
export default {
    color: '#000',
    text: 'Hello, World.'
};
```

You'll notice in the model, we only care about defining the properties that the root level reducers or component care about.

```javascript
// src/actions/index.js
import complex from './some-complex-action';


export default {
    complex,
    color: (state, {data}) => Object.assign({}, state, {color: data}),
    text: (state, {data}) => Object.assign({}, state, {text: data})
};
```

```javascript
// src/components/thing/index.js
export {default as Thing} from './thing.component';
export {default as ThingReducer} from './thing.reducer';
export {default as ThingModel} from './thing.model';
```

```javascript
// src/components/thing/thing.reducer.js
import Reducer from 'redux-reducers';
import ThingModel from './thing.model';


const actions = {
    changeName: (state, {data}) => Object.assign({}, state, {name: data}),
    toggle: state => Object.assign({}, state, {toggle: !state.toggle})
};

export default Reducer.create(ThingModel, actions, {});
```

Notice in thing actions we are assigning directly to the root state being passed into the reducer functions? This is because the thing module only recieves its branch of the state tree. Anything outside of its own state tree, it should not be able to act upon, because that would break the modularity of individual components.

```javascript
// src/components/thing/thing.model.js
export default {
    name: 'none',
    toggle: false
};
```

Given this project setup, creating a store with the AppReducer in app.component.js would result in a fully module reducer tree. For example, dispatching the action `{type: 'color', data: '#fff'}` would be handled by the `color` reducer in `src/actions/index.js`, and dispatching the action `{type: 'thing/changeName', data: 'Harry'}` would fire the `changeName` reducer defined in `src/components/thing/thing.reducer.js`, because the thing reducer is added as a child, identified as `thing` in the root reducer.

This also sets up the state in a way that any module does not need to be aware of another module's branch of the state tree. If you were to run this pseudo-application, you would notice that the initial state tree looks like:
```json
{
    "color": "#000",
    "text": "Hello, world.",
    "thing": {
        "name": "none",
        "toggle": false
    }
}
```
Thus each module has a self-contained state that is ultimately a part of the root application state.

No more lengthy switch statements inside reducers.
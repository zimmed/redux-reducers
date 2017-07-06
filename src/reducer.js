import _ from './util';
import {INIT, SEP} from './const';
import childReducer from './child-reducer';

const split = (action, separator) => {
    const pieces = action.type.split(separator);

    return {
        head: _.head(pieces),
        rest: Object.assign({}, action, {type: pieces.slice(1).join(separator)})
    };
};

const Reducer = {

    create: (model={}, actions={}, reducers={}, {init=INIT, sep=SEP}={}) => {
        const ini = (state, action) => Object.assign({}, model,
            Reducer.branch(state, null, action, reducers, {init}));
        const act = (state, action) => {
            const {head, rest} = split(action, sep);

            if (actions.hasOwnProperty(head)) {
                state = actions[head](state, rest);
            }
            if (reducers.hasOwnProperty(head)) {
                state = Reducer.branch(state, head, rest, reducers, {init});
            }
            return state;
        };
        const reducer = (state, action) => (!state || action.type === init) &&
            ini(state, action) || act(state, action);

        reducer.actions = actions;
        reducer.children = reducers;
        return reducer;
    },

    branch: childReducer
};

export default Reducer;

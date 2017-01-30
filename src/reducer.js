const _ = require('lodash');
const {INIT, SEP} = require('./const');
const childReducer = require('./child-reducer');

const split = (action, separator) => {
    let pieces = _.split(action.type, separator);

    return {
        head: _.head(pieces),
        rest: _.assign({}, action, {type: _.join(_.slice(pieces, 1), separator)})
    };
};

const Reducer = {

    create: (model={}, actions={}, reducers={}, {init=INIT, sep=SEP}={}) => {
        const ini = (state, action) => _.assign({}, model, Reducer.branch(state, null, action, reducers, {init}));
        const act = (state, action) => {
            let {head, rest} = split(action, sep);

            if (_.has(actions, head)) {
                state = actions[head](state, rest);
            }
            if (_.has(reducers, head)) {
                state = Reducer.branch(state, head, rest, reducers, {init});
            }
            return state;
        };
        const reducer = (state, action) => (!state || action.type === init) && ini(state, action) || act(state, action);

        reducer.actions = actions;
        reducer.children = reducers;
        return reducer;
    },

    branch: childReducer
};

module.exports = Reducer;

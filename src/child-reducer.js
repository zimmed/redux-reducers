const _ = require('lodash');
const {INIT} = require('./const');

const reducerMap = (state, action) => (value=_.noop, key) => value(_.get(state, key), action);
const buildChild = (state, key, value) => {
    let out = {};

    out[key] = value;
    return _.omitBy(out, _.isNil);
};

const childReducer = (state, key, action, reducers, {init=INIT}={}) => {
    let update,
        rm = reducerMap(state, action);

    update = (!key || action.type === init) ? _.mapValues(reducers, rm) : buildChild(state, key, rm(reducers[key], key));
    return _.isEmpty(update) && state || _.assign({}, state, update);
};

module.exports = childReducer;

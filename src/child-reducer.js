import _ from './util';
import {INIT} from './const';


const reducerMap = (state, action) =>
    (value=_.noop, key) => value(_.get(state, key), action);

const buildChild = (state, key, value) => {
    const out = {};

    out[key] = value;
    return _.omitBy(out, _.isNil);
};

const childReducer = (state, key, action, reducers, {init=INIT}={}) => {
    const rm = reducerMap(state, action);
    let update;

    update = (!key || action.type === init)
        ? _.mapValues(reducers, rm)
        : buildChild(state, key, rm(reducers[key], key));
    return _.isEmpty(update) && state || Object.assign({}, state, update);
};

export default childReducer;

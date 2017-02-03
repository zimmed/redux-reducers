const _ = require('lodash');
const {expect} = require('chai');
const sinon = require('sinon');
const INIT = require('./const');
const InitAction = {type: INIT};
const DummyAction = {type: 'action', data: 'whatever'};
const childReducer = require('./child-reducer');

describe('childReducer', () => {
    let models = {a: {data: 'a'}, b: {data: 'b'}},
        reducers = {
            a: (state, action) => _.assign({}, state, action.type === INIT ? _.clone(models.a) : {action}),
            b: (state, action) => _.assign({}, state, action.type === INIT ? _.clone(models.b) : {action})
        },
        spies = {};

    beforeEach(() => {
        spies.a = sinon.spy(reducers, 'a');
        spies.b = sinon.spy(reducers, 'b');
    });

    afterEach(() => {
        reducers.a.restore();
        reducers.b.restore();
    });

    it('should be a function', () => {
        expect(childReducer).to.exist;
        expect(childReducer).to.be.a('function');
    });

    it('should return a new state with all props if INIT action passed', () => {
        let state = {};

        expect(() => state = childReducer(state, '', InitAction, reducers)).to.not.throw(Error);
        expect(state).to.exist;
        expect(spies.a.calledOnce).to.equal(true);
        expect(spies.b.calledOnce).to.equal(true);
        expect(state).to.eql(models);
    });

    it('should return a new state given an old state, a map of properties to reducers, and an action for a property', () => {
        let state, oldState = _.cloneDeep(models);

        oldState.a.action = _.clone(DummyAction);
        expect(() => state = childReducer(oldState, 'a' , DummyAction, reducers)).to.not.throw(Error);
        expect(state).to.exist;
        expect(spies.a.calledOnce).to.equal(true);
        expect(spies.b.calledOnce).to.equal(false);
        expect(state).to.eql(oldState);
        expect(state).to.not.equal(oldState);
    });

    it('should return the original state when the action does not match a property in the map', () => {
        let state, oldState = {a: null, b: null};

        expect(() => state = childReducer(oldState, 'c', DummyAction, reducers)).to.not.throw(Error);
        expect(state).to.exist;
        expect(spies.a.calledOnce).to.equal(false);
        expect(spies.b.calledOnce).to.equal(false);
        expect(state).to.eql(oldState);
        expect(state).to.equal(oldState);
    });
});

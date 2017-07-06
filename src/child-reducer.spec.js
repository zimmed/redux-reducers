import {expect} from 'chai';
import sinon from 'sinon';
import INIT from './const';
import childReducer from './child-reducer';


const InitAction = {type: INIT};
const DummyAction = {type: 'action', data: 'whatever'};
const clone = obj => Object.assign({}, obj);
const cloneDeep = obj => JSON.parse(JSON.stringify(obj));

describe('childReducer', () => {
    const models = {a: {data: 'a'}, b: {data: 'b'}};
    const reducers = {
        a: (state, action) => Object.assign({}, state,
            action.type === INIT? clone(models.a) : {action}),
        b: (state, action) => Object.assign({}, state,
            action.type === INIT ? clone(models.b) : {action})
    };
    const spies = {};

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
        let state, oldState = cloneDeep(models);

        oldState.a.action = clone(DummyAction);
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

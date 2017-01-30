const _ = require('lodash');
const {expect} = require('chai');
const sinon = require('sinon');
const Reducer = require('./reducer');
const {INIT} = require('./const');

const InitAction = {type: INIT};

describe('Reducer Factory', () => {

    it('should be an object with the static methods: create and branch', () => {
        expect(Reducer).to.exist;
        expect(Reducer).to.have.property('create').which.is.a('function');
        expect(Reducer).to.have.property('branch').which.is.a('function');
    });

    describe('create method', () => {

        it('should create a default reducer function when no arguments given', () => {
            let model, reducer;

            expect(() => reducer = Reducer.create()).to.not.throw(Error);
            expect(reducer).to.exist;
            expect(reducer).to.be.a('function');
            expect(() => model = reducer()).to.not.throw(Error);
            expect(model).to.exist;
            expect(model).to.eql({});
        });

        it('should create a reducer with event handlers', () => {
            let reducer;

            expect(() => reducer = Reducer.create({}, {
                myAction: (state, action) => _.assign(state, action.data)
            })).to.not.throw(Error);
            expect(reducer).to.be.a('function');
        });

        it('should create a reducer with child reducers', () => {
            let reducer;

            expect(() => reducer = Reducer.create({}, {}, {
                child: (state, action) => _.assign(state, action.data, {t: action.type})
            })).to.not.throw(Error);
            expect(reducer).to.be.a('function');
        });

        it('should create a reducer with both arguments', () => {
            let reducer;

            expect(() => reducer = Reducer.create({},  {
                myAction: (state, action) => _.assign(state, action.data)
            }, {
                child: (state, action) => _.assign(state, action.data, {t: action.type})
            })).to.not.throw(Error);
            expect(reducer).to.be.a('function');
        });
    });

    describe('branch method', () => {

        it('should be the reduce-child method', () => {
            expect(Reducer.branch).to.equal(require('./child-reducer'));
        });
    });
});

describe('Reducer instance', () => {
    let model,
        events,
        children,
        reducer,
        stub;

    beforeEach(() => {
        model = {data: null, childEvent: false};
        events = {
            setDataField: (state, action) => _.assign({}, state, {data: action.data}),
            child: (state, action) => _.assign({}, state, {childEvent: true, child: null})
        };
        children = {child: Reducer.create({a: 'a'})};
        reducer = Reducer.create(model, events, children);
        stub = sinon.stub(Reducer, 'branch', (s, k, a, r) => {
            let o = {};

            if (_.has(r, k)) {
                o[k] = r[k](s[k], a);
            } else if (!k || a.type === INIT) {
                o = _.mapValues(r, (val, key) => val(_.get(s, k), a));
            }
            return _.assign({}, s, o);
        });
    });

    afterEach(() => {
        stub.restore();
    });

    it('should be a pure function that takes a state and action and returns a state', () => {
        let state = {};

        expect(reducer).to.exist;
        expect(reducer).to.be.a('function');
        expect(() => state = reducer(state, 'noop')).to.not.throw(Error);
        expect(state).to.exist;
        expect(state).to.be.an('object');
        expect(stub.callCount).to.equal(0);
    });

    it('should return the same state if no action to handle', () => {
        let oldState = {a: {b: 'thing'}},
            state = reducer(oldState, 'noop');

        expect(stub.callCount).to.equal(0);
        expect(state).to.eql(oldState);
        expect(state).to.equal(oldState);
    });

    it('should return the default model with child properties if INIT action is passed', () => {
        let state = {};

        expect(() => state = reducer(state, InitAction)).to.not.throw(Error);
        expect(stub.callCount).to.equal(2);
        expect(state).to.eql(_.assign({}, model, {child: {a: 'a'}}));
        expect(state).to.not.equal(model);
    });

    it('should allow action handlers to update the state functionally', () => {
        let nstate, state = reducer({}, InitAction);

        stub.reset();
        expect(() => nstate = reducer(state, {type: 'setDataField', data: 1})).to.not.throw(Error);
        expect(stub.callCount).to.equal(0);
        expect(state).to.eql(_.assign({}, model, {child: {a: 'a'}}));
        expect(nstate).to.eql(_.assign({}, model, {data: 1, child: {a: 'a'}}));
    });

    it('should prioritize actions over child reducers so that actions are called first', () => {
        let state = reducer({}, InitAction);

        stub.reset();
        expect(() => state = reducer(state, {type: `child/${INIT}`})).to.not.throw(Error);
        expect(stub.callCount).to.equal(2);
        expect(state.childEvent).to.equal(true);
        expect(state.child).to.eql({a: 'a'});
    });
});

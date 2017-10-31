import R from 'ramda';
import Immutable, { Iterable } from 'immutable';

// change this Immutable object into a JS object
const convertToJs = (state) => state.toJS();

// optionally convert this object into a JS object if it is Immutable
const fromImmutable = R.when(Iterable.isIterable, convertToJs);

// convert this JS object into an Immutable object
const toImmutable = (raw) => Immutable.fromJS(raw);

// the transform interface that redux-persist is expecting
export default {
  out: (state) => {
    return toImmutable(state);
  },
  in: (raw) => {
    return fromImmutable(raw);
  }
};

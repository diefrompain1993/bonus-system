import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGOUT,
  GET_ENGINEERS_SUCCESS,
  GET_ENGINEERS_FAIL,
  GET_USERS_BY_BC_SUCCESS,
  GET_USERS_BY_BC_FAIL,
} from '../types';

const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null,
  engineers: [],
  engineersLoading: false,
  engineersError: null
};

export default function authReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case LOGIN_SUCCESS:
      return {
        ...state,
        token: payload.token,
        loading: true,
        error: null,
      };
    case USER_LOADED:
      return {
        ...state,
        user: payload,
        isAuthenticated: true,
        loading: false,
      };
    case GET_ENGINEERS_SUCCESS:
      return {
        ...state,
        engineers: payload,
        engineersLoading: false,
        engineersError: null,
      };
    case GET_ENGINEERS_FAIL:
      return {
        ...state,
        engineers: [],
        engineersLoading: false,
        engineersError: payload,
      };
    case LOGIN_FAIL:
    case AUTH_ERROR:
    case LOGOUT:
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: payload || null,
      };
    case GET_USERS_BY_BC_SUCCESS:
      return {
        ...state,
        usersByBC: action.payload,
        loading: false,
        error: null,
      };
    case GET_USERS_BY_BC_FAIL:
      return {
        ...state,
        usersByBC: [],
        loading: false,
        error: action.payload,
      };
    default:
      return state;
  }
}

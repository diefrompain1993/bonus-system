// usersReducer.js
import {
  GET_USERS_REQUEST,
  GET_USERS_SUCCESS,
  GET_USERS_FAIL,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_FAIL,
  UPDATE_USER_REQUEST,
  UPDATE_USER_SUCCESS,
  UPDATE_USER_FAIL,
  ARCHIVE_USER_REQUEST,
  ARCHIVE_USER_SUCCESS,
  ARCHIVE_USER_FAIL,
  GET_ENGINEERS_SUCCESS,
  GET_ENGINEERS_FAIL,
  GET_USERS_BY_BC_SUCCESS,
  GET_USERS_BY_BC_FAIL,
  UNARCHIVE_USER_REQUEST,
  UNARCHIVE_USER_SUCCESS,
  UNARCHIVE_USER_FAIL,
} from "../types";

const initialState = {
  loading: false,
  users: [],
  error: null,
  engineers: [],
  usersByBC: [],
};

export default function (state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case GET_USERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case GET_USERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: payload,
        error: null,
      };

    case GET_USERS_FAIL:
      return {
        ...state,
        loading: false,
        error: payload,
      };

    case CREATE_USER_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case CREATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case CREATE_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: payload,
      };

    case UPDATE_USER_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case UPDATE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case UPDATE_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: payload,
      };

    case ARCHIVE_USER_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case ARCHIVE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };

    case ARCHIVE_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: payload,
      };

    case GET_ENGINEERS_SUCCESS:
      return {
        ...state,
        engineers: action.payload,
        loading: false,
        error: null,
      };
    case GET_ENGINEERS_FAIL:
      return {
        ...state,
        engineers: [],
        loading: false,
        error: action.payload,
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
    case UNARCHIVE_USER_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case UNARCHIVE_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
      };
    case UNARCHIVE_USER_FAIL:
      return {
        ...state,
        loading: false,
        error: payload,
      };
  

    default:
      return state;
  }
}

// src/store/reducers/businessCentersReducer.js
import {
  GET_BUSINESS_CENTERS_REQUEST,
  GET_BUSINESS_CENTERS_SUCCESS,
  GET_BUSINESS_CENTERS_FAIL,
  CREATE_BUSINESS_CENTER_REQUEST,
  CREATE_BUSINESS_CENTER_SUCCESS,
  CREATE_BUSINESS_CENTER_FAIL,
  UPDATE_BUSINESS_CENTER_REQUEST,
  UPDATE_BUSINESS_CENTER_SUCCESS,
  UPDATE_BUSINESS_CENTER_FAIL,
  ARCHIVE_BUSINESS_CENTER_REQUEST,
  ARCHIVE_BUSINESS_CENTER_SUCCESS,
  ARCHIVE_BUSINESS_CENTER_FAIL,
  UNARCHIVE_BUSINESS_CENTER_REQUEST,
  UNARCHIVE_BUSINESS_CENTER_SUCCESS,
  UNARCHIVE_BUSINESS_CENTER_FAIL,
} from "../types";

const initialState = {
  businessCenters: [],
  loading: false, // общее "глобальное" состояние загрузки списка
  error: null,

  createLoading: false,
  updateLoading: false,
  archiveLoading: false,
};

export default function businessCentersReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    // ----- GET ALL -----
    case GET_BUSINESS_CENTERS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case GET_BUSINESS_CENTERS_SUCCESS:
      return {
        ...state,
        loading: false,
        businessCenters: payload, // список [{ id, name, address, archived }, ...]
      };
    case GET_BUSINESS_CENTERS_FAIL:
      return {
        ...state,
        loading: false,
        error: payload,
      };

    // ----- CREATE -----
    case CREATE_BUSINESS_CENTER_REQUEST:
      return {
        ...state,
        createLoading: true,
        error: null,
      };
    case CREATE_BUSINESS_CENTER_SUCCESS:
      return {
        ...state,
        createLoading: false,
        businessCenters: [...state.businessCenters, payload],
      };
    case CREATE_BUSINESS_CENTER_FAIL:
      return {
        ...state,
        createLoading: false,
        error: payload,
      };

    // ----- UPDATE -----
    case UPDATE_BUSINESS_CENTER_REQUEST:
      return {
        ...state,
        updateLoading: true,
        error: null,
      };
    case UPDATE_BUSINESS_CENTER_SUCCESS:
      return {
        ...state,
        updateLoading: false,
        // Заменяем отредактированный BC в массиве
        businessCenters: state.businessCenters.map((bc) =>
          bc.id === payload.id ? payload : bc
        ),
      };
    case UPDATE_BUSINESS_CENTER_FAIL:
      return {
        ...state,
        updateLoading: false,
        error: payload,
      };

    // ----- ARCHIVE / UNARCHIVE -----
    case ARCHIVE_BUSINESS_CENTER_REQUEST:
    case UNARCHIVE_BUSINESS_CENTER_REQUEST:
      return {
        ...state,
        archiveLoading: true,
        error: null,
      };

    case ARCHIVE_BUSINESS_CENTER_SUCCESS:
    case UNARCHIVE_BUSINESS_CENTER_SUCCESS:
      return {
        ...state,
        archiveLoading: false,
        // Обновляем соответствующий БЦ
        businessCenters: state.businessCenters.map((bc) =>
          bc.id === payload.id ? payload : bc
        ),
      };

    case ARCHIVE_BUSINESS_CENTER_FAIL:
    case UNARCHIVE_BUSINESS_CENTER_FAIL:
      return {
        ...state,
        archiveLoading: false,
        error: payload,
      };

    default:
      return state;
  }
}

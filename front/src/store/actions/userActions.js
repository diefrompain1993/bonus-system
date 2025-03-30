import api from "../../utils/api";
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

// Получить всех пользователей
export const getAllUsers = () => async (dispatch) => {
  try {
    dispatch({ type: GET_USERS_REQUEST });
    const res = await api.get("/users"); // GET /users
    dispatch({
      type: GET_USERS_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: GET_USERS_FAIL,
      payload: err.response
        ? err.response.data
        : { detail: "Ошибка при загрузке пользователей" },
    });
  }
};

// Создать пользователя
export const createUser = (userData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_USER_REQUEST });
    const res = await api.post("/users", userData);
    dispatch({ type: CREATE_USER_SUCCESS, payload: res.data });
    dispatch(getAllUsers());
  } catch (err) {
    dispatch({
      type: CREATE_USER_FAIL,
      payload: err.response
        ? err.response.data
        : { detail: "Ошибка при создании пользователя" },
    });
  }
};

// Обновить пользователя
export const updateUser = (userId, userData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_USER_REQUEST });
    const res = await api.put(`/users/${userId}`, userData);
    dispatch({ type: UPDATE_USER_SUCCESS, payload: res.data });
    dispatch(getAllUsers());
  } catch (err) {
    dispatch({
      type: UPDATE_USER_FAIL,
      payload: err.response
        ? err.response.data
        : { detail: "Ошибка при обновлении пользователя" },
    });
  }
};

// Архивировать (DELETE или PATCH)
export const archiveUser = (userId) => async (dispatch) => {
  try {
    dispatch({ type: ARCHIVE_USER_REQUEST });
    const res = await api.patch(`/users/${userId}/archive`);
    dispatch({ type: ARCHIVE_USER_SUCCESS, payload: res.data });
    dispatch(getAllUsers());
  } catch (err) {
    dispatch({
      type: ARCHIVE_USER_FAIL,
      payload: err.response
        ? err.response.data
        : { detail: "Ошибка при архивировании пользователя" },
    });
  }
};
export const unarchiveUser = (userId) => async (dispatch) => {
  try {
    dispatch({ type: UNARCHIVE_USER_REQUEST });
    const res = await api.patch(`/users/${userId}/unarchive`);
    dispatch({ type: UNARCHIVE_USER_SUCCESS, payload: res.data });
    // После операции — обновить список пользователей
    dispatch(getAllUsers());
  } catch (err) {
    dispatch({
      type: UNARCHIVE_USER_FAIL,
      payload: err.response
        ? err.response.data
        : { detail: "Ошибка при разархивировании пользователя" },
    });
  }
};

// Получить инженеров (пример)
export const getEngineers = () => async (dispatch) => {
  try {
    const res = await api.get("/users", { params: { role: "ENGINEER" } });
    dispatch({
      type: GET_ENGINEERS_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: GET_ENGINEERS_FAIL,
      payload: err.response
        ? err.response.data
        : { detail: "Ошибка при загрузке инженеров" },
    });
  }
};

// Получить пользователей по конкретному БЦ
export const getUsersByBusinessCenter = (businessCenterId) => async (
  dispatch
) => {
  try {
    const res = await api.get("/users", {
      params: { business_center_id: businessCenterId },
    });
    dispatch({
      type: GET_USERS_BY_BC_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: GET_USERS_BY_BC_FAIL,
      payload: err.response
        ? err.response.data
        : { detail: "Ошибка при загрузке пользователей БЦ" },
    });
  }
};

// src/store/actions/businessCenterActions.js
import api from "../../utils/api"; // axios-инстанс (или аналогичный)

// Типы:
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

// 1) Получение списка всех БЦ
export const getBusinessCenters = () => async (dispatch) => {
  try {
    dispatch({ type: GET_BUSINESS_CENTERS_REQUEST });

    // Предполагается, что эндпоинт: GET /business_centers
    const res = await api.get("/business_centers");

    dispatch({
      type: GET_BUSINESS_CENTERS_SUCCESS,
      payload: res.data, // массив { id, name, address, archived, ... }
    });
  } catch (err) {
    dispatch({
      type: GET_BUSINESS_CENTERS_FAIL,
      payload: err.response ? err.response.data : { detail: "Ошибка сервера" },
    });
  }
};

// 2) Создание нового БЦ
export const createBusinessCenter = (data) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_BUSINESS_CENTER_REQUEST });

    // Предполагается, что эндпоинт: POST /business_centers
    // data = { name, address, ... }
    const res = await api.post("/business_centers", data);

    dispatch({
      type: CREATE_BUSINESS_CENTER_SUCCESS,
      payload: res.data, // созданный объект БЦ
    });
  } catch (err) {
    dispatch({
      type: CREATE_BUSINESS_CENTER_FAIL,
      payload: err.response ? err.response.data : { detail: "Ошибка сервера" },
    });
    // Если хотим "пробросить" ошибку наверх (в компонент),
    // чтобы там можно было показать сообщение:
    throw err;
  }
};

// 3) Обновление существующего БЦ
export const updateBusinessCenter = (id, data) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_BUSINESS_CENTER_REQUEST });

    // Предполагается, что эндпоинт: PUT /business_centers/{id}
    const res = await api.put(`/business_centers/${id}`, data);

    dispatch({
      type: UPDATE_BUSINESS_CENTER_SUCCESS,
      payload: res.data, // обновлённый объект БЦ
    });
  } catch (err) {
    dispatch({
      type: UPDATE_BUSINESS_CENTER_FAIL,
      payload: err.response ? err.response.data : { detail: "Ошибка сервера" },
    });
    throw err;
  }
};

// 4) Архивирование БЦ
export const archiveBusinessCenter = (id) => async (dispatch) => {
  try {
    dispatch({ type: ARCHIVE_BUSINESS_CENTER_REQUEST });

    // Предполагается, что эндпоинт: PATCH /business_centers/{id}/archive
    const res = await api.patch(`/business_centers/${id}/archive`);

    dispatch({
      type: ARCHIVE_BUSINESS_CENTER_SUCCESS,
      payload: res.data, // объект БЦ, где archived=true
    });
  } catch (err) {
    dispatch({
      type: ARCHIVE_BUSINESS_CENTER_FAIL,
      payload: err.response ? err.response.data : { detail: "Ошибка сервера" },
    });
    throw err;
  }
};

// 5) Разархивирование БЦ
export const unarchiveBusinessCenter = (id) => async (dispatch) => {
  try {
    dispatch({ type: UNARCHIVE_BUSINESS_CENTER_REQUEST });

    // Предполагается, что эндпоинт: PATCH /business_centers/{id}/unarchive
    const res = await api.patch(`/business_centers/${id}/unarchive`);

    dispatch({
      type: UNARCHIVE_BUSINESS_CENTER_SUCCESS,
      payload: res.data, // объект БЦ, где archived=false
    });
  } catch (err) {
    dispatch({
      type: UNARCHIVE_BUSINESS_CENTER_FAIL,
      payload: err.response ? err.response.data : { detail: "Ошибка сервера" },
    });
    throw err;
  }
};

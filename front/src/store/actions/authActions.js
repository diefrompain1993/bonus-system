import api from "../../utils/api";
import {
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGOUT,
  GET_ENGINEERS_SUCCESS,
  GET_ENGINEERS_FAIL,
} from "../types";

// Загрузка текущего пользователя
export const loadUser = () => async (dispatch) => {
  try {
    const res = await api.get("/auth/me");
    dispatch({
      type: USER_LOADED,
      payload: {
        ...res.data,
        role: res.data.role.toLowerCase(),
      },
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

// Вход пользователя
export const userLogin = (login, password) => async (dispatch) => {
  try {
    const res = await api.post("/auth/login", { login, password });
    const { access_token } = res.data;

    // Сохраняем токен в localStorage
    localStorage.setItem("token", access_token);

    dispatch({
      type: LOGIN_SUCCESS,
      payload: { token: access_token },
    });

    // Загружаем данные пользователя
    dispatch(loadUser());
  } catch (err) {
    dispatch({
      type: LOGIN_FAIL,
      payload: err.response ? err.response.data : { detail: "Ошибка сервера" },
    });
  }
};

// Выход пользователя
export const logout = () => (dispatch) => {
  localStorage.removeItem("token");
  dispatch({ type: LOGOUT });
};

// Загрузка списка инженеров для админа
export const getEngineers = () => async (dispatch) => {
  try {
    const res = await api.get("/users?role=engineer"); // Assuming the API filters by role
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

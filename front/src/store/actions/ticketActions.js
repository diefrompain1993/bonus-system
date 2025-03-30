import api from '../../utils/api';
import {
  CREATE_TICKET_SUCCESS,
  CREATE_TICKET_FAIL,
  GET_TICKETS_SUCCESS,
  GET_TICKETS_FAIL,
  ASSIGN_ENGINEER_SUCCESS,
  ASSIGN_ENGINEER_FAIL,
  GET_TICKET_SUCCESS,
  GET_TICKET_FAIL,
  ADD_COMMENT_SUCCESS,
  ADD_COMMENT_FAIL,
  UPDATE_TICKET_STATUS_SUCCESS,
  UPDATE_TICKET_STATUS_FAIL,
  DELETE_COMMENT_SUCCESS,
  DELETE_COMMENT_FAIL,
} from '../types';

// Создание новой заявки
export const createTicket = (ticketData) => async dispatch => {
  try {
    const res = await api.post('/tickets', ticketData);
    dispatch({
      type: CREATE_TICKET_SUCCESS,
      payload: res.data,
    });
    // Дополнительно можно обновить список заявок
    dispatch(getTickets());
  } catch (err) {
    dispatch({
      type: CREATE_TICKET_FAIL,
      payload: err.response ? err.response.data : { detail: 'Ошибка сервера' },
    });
    throw err; // Чтобы обработать ошибку в компоненте
  }
};

// Получение списка заявок
export const getTickets = (filters = {}) => async dispatch => {
  try {
    const res = await api.get('/tickets', { params: filters });
    dispatch({
      type: GET_TICKETS_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    console.error('Error fetching tickets:', err); // Для отладки
    dispatch({
      type: GET_TICKETS_FAIL,
      payload: err.response ? err.response.data : { detail: 'Ошибка сервера' },
    });
  }
};

// Назначение инженера на заявку
export const assignEngineer = (ticketId, engineerId) => async dispatch => {
  try {
    const res = await api.post(`/tickets/${ticketId}/assign`, { engineer_id: engineerId });
    dispatch({
      type: ASSIGN_ENGINEER_SUCCESS,
      payload: res.data,
    });
    // Обновляем данные заявки после назначения
    dispatch(getTicketById(ticketId));
  } catch (err) {
    dispatch({
      type: ASSIGN_ENGINEER_FAIL,
      payload: err.response ? err.response.data : { detail: 'Ошибка сервера' },
    });
    throw err; // Чтобы обработать ошибку в компоненте
  }
};

// Получение конкретной заявки по ID
export const getTicketById = (ticketId) => async dispatch => {
  try {
    const res = await api.get(`/tickets/${ticketId}`);
    dispatch({
      type: GET_TICKET_SUCCESS,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: GET_TICKET_FAIL,
      payload: err.response ? err.response.data : { detail: 'Ошибка при загрузке заявки' },
    });
    throw err;
  }
};

// Добавление комментария к заявке
export const addCommentToTicket = (ticketId, formData) => async dispatch => {
  try {
    const res = await api.post(`/tickets/${ticketId}/comments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    dispatch({
      type: ADD_COMMENT_SUCCESS,
      payload: res.data,
    });
    dispatch(getTicketById(ticketId)); // Обновляем данные заявки после добавления комментария
  } catch (err) {
    console.error("Error adding comment:", err, res.data); // Проверка ошибки
    dispatch({
      type: ADD_COMMENT_FAIL,
      payload: err.response ? err.response.data : { detail: 'Ошибка при добавлении комментария' },
    });
    throw err;
  }
};

// ticketActions.js
export const updateTicketStatus = (ticketId, status) => async dispatch => {
  try {
    // Отправляем `status` в теле запроса (body) как JSON
    const res = await api.put(`/tickets/${ticketId}/status`, { status });
    dispatch({
      type: UPDATE_TICKET_STATUS_SUCCESS,
      payload: res.data,
    });
    return res.data;
  } catch (err) {
    dispatch({
      type: UPDATE_TICKET_STATUS_FAIL,
      payload: err.response ? err.response.data : { detail: 'Ошибка сервера' },
    });
    throw err;
  }
};


export const deleteComment = (commentId) => async dispatch => {
  try {
    await api.delete(`tickets/${commentId}`);
    dispatch({
      type: DELETE_COMMENT_SUCCESS,
      payload: commentId,
    });
  } catch (err) {
    dispatch({
      type: DELETE_COMMENT_FAIL,
      payload: err.response ? err.response.data : { detail: 'Ошибка сервера' },
    });
    throw err;
  }
};
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

const initialState = {
  tickets: [],
  loading: true,
  createLoading: false,
  error: null,
  createError: null,
  assignError: null,
  assignLoading: false,
};

export default function(state = initialState, action) {
  const { type, payload } = action;

  switch(type) {
    case GET_TICKETS_SUCCESS:
      return {
        ...state,
        tickets: payload,
        loading: false,
        error: null,
      };
    case GET_TICKETS_FAIL:
      return {
        ...state,
        tickets: [],
        loading: false,
        error: payload,
      };
    case CREATE_TICKET_SUCCESS:
      return {
        ...state,
        tickets: [...state.tickets, payload],
        createLoading: false,
        createError: null,
      };
    case CREATE_TICKET_FAIL:
      return {
        ...state,
        createLoading: false,
        createError: payload,
      };
    case ASSIGN_ENGINEER_SUCCESS:
      return {
        ...state,
        assignLoading: false,
        assignError: null,
        // Обновляем список заявок (если уже загружен)
        tickets: state.tickets.map(ticket =>
          ticket.id === action.payload.id ? action.payload : ticket
        ),
      };
    case GET_TICKET_SUCCESS:
      return {
        ...state,
        ticket: {
          ...action.payload,
          comments: action.payload.comments || [], // Инициализация comments как пустого массива, если оно отсутствует
        },
        loading: false,
        error: null,
      };
    case GET_TICKET_FAIL:
      return {
        ...state,
        ticket: null,
        loading: false,
      };
    case ASSIGN_ENGINEER_FAIL:
      return {
        ...state,
        assignLoading: false,
        assignError: payload,
      };
    case ADD_COMMENT_SUCCESS:
      return {
        ...state,
        ticket: {
          ...state.ticket,
          comments: [...state.ticket.comments, action.payload], // Добавляем новый комментарий к списку
        },
        error: null,
      };
    case ADD_COMMENT_FAIL:
      return {
        ...state,
        error: action.payload,
      };
      case UPDATE_TICKET_STATUS_SUCCESS:
        return {
          ...state,
          ticket: {
            ...state.ticket,
            status: action.payload.status, // Обновляем статус тикета в состоянии
          },
        };
      case UPDATE_TICKET_STATUS_FAIL:
        return {
          ...state,
          error: action.payload,
        };
      case DELETE_COMMENT_SUCCESS:
        return {
          ...state,
          ticket: {
            ...state.ticket,
            comments: state.ticket.comments.filter(comment => comment.id !== action.payload)
          }
        };
      case DELETE_COMMENT_FAIL:
        return {
          ...state,
          error: action.payload,
        };
      default:
        return state;
  }
}

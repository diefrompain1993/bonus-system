import { combineReducers } from 'redux';
import authReducer from './authReducer';
import ticketReducer from './ticketReducer';
import businessCenterReducer from './businessCenterReaducer';
import usersReducer from './usersReducer';

export default combineReducers({
  auth: authReducer,
  tickets: ticketReducer,
  businessCenters: businessCenterReducer,
  users: usersReducer,
});

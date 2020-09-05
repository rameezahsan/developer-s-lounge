import axios from 'axios';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_PROFILE,
} from './types';
import { setAlert } from './alert';
import setAuthToken from '../utils/setAuthToken';

//LOADING A USER
export const loadUser = () => async (dispatch) => {
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    const res = await axios.get('/api/auth');
    dispatch({
      type: USER_LOADED,
      payload: res.data,
    });
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
    });
  }
};

//REGISTER A USER
export const register = ({ name, email, password }) => async (dispatch) => {
  // const config = {
  //   headers: {
  //     'Content-Type ': 'application/json',
  //   },
  // };

  const body = { name, email, password };
  try {
    axios
      .post('/api/users', body)
      .then((res) => {
        console.log(res);
        dispatch({
          type: REGISTER_SUCCESS,
          payload: res.data, //token will be returned when successul register occurs
        });
        dispatch(loadUser());
      })
      .catch((err) => {
        console.log(err.response);
        const errors = err.response.data;
        if (errors) {
          errors.forEach((error) =>
            dispatch(setAlert(error.message, 'danger'))
          );
        }
        dispatch({
          type: REGISTER_FAIL,
        });
      });
    //const res = await axios.post('/api/users', body, config);
  } catch (err) {
    // console.log(err.response);
  }
};

//LOGGING IN A USER
export const login = (email, password) => async (dispatch) => {
  // const config = {
  //   headers: {
  //     'Content-Type ': 'application/json',
  //   },
  // };

  const body = { email, password };
  try {
    axios
      .post('/api/auth', body)
      .then((res) => {
        console.log(res);
        dispatch({
          type: LOGIN_SUCCESS,
          payload: res.data, //token will be returned when successul login occurs
        });
        dispatch(loadUser());
      })
      .catch((err) => {
        console.log(err.response);
        const errors = err.response.data;
        // if (errors) {
        //   errors.forEach((error) =>
        //     dispatch(setAlert(error.message, 'danger'))
        //   );
        // }
        dispatch({
          type: LOGIN_FAIL,
        });
      });
    //const res = await axios.post('/api/users', body, config);
  } catch (err) {
    // console.log(err.response);
  }
};

//LOGGING OUT AND CLEARING  A PROFILE
export const logout = () => (dispatch) => {
  dispatch({
    type: CLEAR_PROFILE,
  });
  dispatch({
    type: LOGOUT,
  });
};

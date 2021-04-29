// import axios from 'axios';

import axios from 'axios';
import { showAlert } from './alerts';

export const signup = async (name, email, password, confirmPassword) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: { name, email, password, confirmPassword },
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Sign Up successful');
            window.location.assign('/login');
        }
    } catch (error) {
        showAlert('error', error);
    }
};

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: { email, password },
        });

        if (res.data.status === 'success') {
            showAlert('success', 'Login successful');
            window.location.assign('/');
        }
    } catch (error) {
        showAlert('error', error);
    }
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout',
        });
        if (res.data.status === 'success') window.location.assign('/login');
    } catch (error) {
        console.log(error);
        showAlert('error', 'Error logging out!, Please try again');
    }
};

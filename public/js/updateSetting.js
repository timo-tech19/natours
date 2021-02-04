import axios from 'axios';
import { showAlert } from './alerts';

//type either password or userinfo
export const updateSettings = async (data, type) => {
    try {
        // Send updataed information
        const res = await axios({
            method: 'PATCH',
            url:
                type === 'password'
                    ? '/api/v1/users/update-password'
                    : '/api/v1/users/update-me',
            data,
        });

        // reload page if successful
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} successfully updated`);
        } else {
            showAlert('error', res.data.message);
        }
    } catch (error) {
        console.log(error);
        showAlert('error', error.message);
    }
};

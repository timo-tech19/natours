import '@babel/polyfill';
import { login, logout } from './login';
import { updateSettings } from './updateSetting';
import { bookTour } from './stripe';

// DOM Elements
// const mapbBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const settingBtn = document.querySelector('.btn-data');
const passwordBtn = document.querySelector('.btn-password');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const nameField = document.getElementById('name');
const bookBtn = document.getElementById('book-btn');

// Add event to login form
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailField.value;
        const password = passwordField.value;

        login(email, password);
    });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (settingBtn)
    settingBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', nameField.value);
        form.append('email', emailField.value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'user data');
    });

if (passwordBtn)
    passwordBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        passwordBtn.textContent = 'Updating...';

        const password = document.getElementById('password-current').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('password-confirm')
            .value;

        await updateSettings(
            { password, newPassword, confirmNewPassword },
            'password'
        );
        passwordBtn.textContent = 'Save Password';
    });

if (bookBtn)
    bookBtn.addEventListener('click', async (e) => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        await bookTour(tourId);
    });

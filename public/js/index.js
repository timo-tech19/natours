import '@babel/polyfill';
import { login, logout, signup } from './login';
import { updateSettings } from './updateSetting';
import { bookTour } from './stripe';
import { showAlert } from './alerts';

// DOM Elements
// const mapbBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const btnSignup = document.querySelector('.btn-signup');
const logoutBtn = document.querySelector('.nav__el--logout');
const settingBtn = document.querySelector('.btn-data');
const passwordBtn = document.querySelector('.btn-password');
const emailField = document.getElementById('email');
const passwordField = document.getElementById('password');
const confirmPasswordField = document.getElementById('confirm-password');
const nameField = document.getElementById('name');
const usernameField = document.getElementById('user-name');
const bookBtn = document.getElementById('book-btn');

// Add event to login form
if (btnSignup) {
    btnSignup.addEventListener('click', (e) => {
        e.preventDefault();

        const name = usernameField.value;
        const email = emailField.value;
        const password = passwordField.value;
        const confirmPassword = confirmPasswordField.value;

        signup(name, email, password, confirmPassword);
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = emailField.value;
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

const alertMessage = document.querySelector('body').dataset.alert;
if (alertMessage) showAlert('success', alertMessage, 20);

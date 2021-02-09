export const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) {
        el.remove();
    }
};

// type = success || error
export const showAlert = (type, message, time = 5) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">
                    ${message}
                  </div>`;

    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    setTimeout(hideAlert, time * 1000);
};

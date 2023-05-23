const getFormNumber = () => {
    let temp = null;

    for (let i = 1; i <= 4; i++) {
        const form = document.querySelector(`.c-register__form-${i}`);
        if (form) temp = i;
    }

    return temp;
}

const validateFormField = (labelSelector, errorMessage, condition, checkCondition = undefined) => {
    // If check condition is not undefined but is not fulfilled then stop the validation from running.
    if (typeof checkCondition !== "undefined" && !checkCondition) return;

    const label = document.querySelector(labelSelector);
    const error = document.querySelector(`${labelSelector} .c-register__formError`)

    // If condition IS fullfilled but there's still an error message then remove it.
    if (condition && error) error.remove();

    // If both the condition is not fullfilled and there is no current error message then create a new error message.
    if (!condition && !error) {
        let error = document.createElement("span");
        error.className = "c-register__formError";
        error.innerHTML = errorMessage;

        if (label) label.appendChild(error)
        return false;
    }

    return true;
}

const getSessionInfo = function () {
    return fetch('/actions/users/session-info', {
        headers: {
            'Accept': 'application/json',
        },
    })
        .then(response => response.json());
};

const createElement = (type, className, html) => {
    let temp = document.createElement(type);
    if(className) temp.className = className;
    if(html) temp.innerHTML = html;

    return temp;
}

export {
    getFormNumber,
    validateFormField,
    getSessionInfo,
    createElement
}
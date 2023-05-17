const getFormNumber = () => {
    let temp = null;

    for (let i = 1; i <= 4; i++) {
        const form = document.querySelector(`.c-register__form-${i}`);
        if (form) temp = i;
    }

    return temp;
}

export {
    getFormNumber,
    
}
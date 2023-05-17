import { getFormNumber } from "./register-helpers.js";

class Register {
    constructor() {
        this.formNumber = getFormNumber();

        this.init();
    }

    init() {
        switch (this.formNumber) {
            case 1: this.formOne(); break;
            case 2: this.formTwo(); break;
            case 3: this.formThree(); break;
            case 4: this.formFour(); break;
            default: break;
        }
    }

    continueButton = () => {
        const button = document.querySelector(".c-register__formContinue");
        if(button) button.addEventListener("click", () => {
            window.location.replace(`/register/${getFormNumber() + 1}`)
        })
    }

    previousButton = () => {
        const button = document.querySelector(".c-register__formPrevious");
        if(button) button.addEventListener("click", () => {
            window.location.replace(`/register/${getFormNumber() - 1}`)
        })
    }

    finishButton = () => {
        document.querySelector(".c-register__formFinish").addEventListener("click", () => {

        })
    }

    formOne = () => {
        this.continueButton();
        const packageButtons = document.querySelectorAll(".c-register__formPackageSelect")

        packageButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const selected = document.querySelector(".c-register__formPackageSelect.selected");
                if(selected) selected.classList.remove("selected");

                button.classList.add("selected")
            })
        })
        console.log(packageButtons)
    }

    formTwo = () => {
        this.continueButton();
        this.previousButton();
    }

formThree = () => {
        this.continueButton();
        this.previousButton();
    }

    formFour = () => {
        this.previousButton();
        this.finishButton();
    }
}

new Register();
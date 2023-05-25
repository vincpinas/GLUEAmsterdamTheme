import { createElement, getFormNumber, getSessionInfo, handleErrorMessage, validateFormField } from "./register-helpers.js";

class Register {
    constructor() {
        this.formNumber = getFormNumber();
        this.registerBaseUrl = "/sign-up"

        this.init();
    }

    // Load in the proper form functionality
    init() {
        switch (this.formNumber) {
            case 1: this.formOne(); break;
            case 2: this.formTwo(); break;
            case 3: this.formThree(); break;
            case 4: this.formFour(); break;
            case 5: this.formFive(); break;
            default: break;
        }
    }

    // Validate form fields and return user to page one if form fields have not been filled in.
    validate(formNumber) {
        // register field values stored in session
        let r = JSON.parse(sessionStorage.getItem("reg_obj"));

        switch (formNumber) {
            case 2:
                r && r.package ? null : location.replace(`${this.registerBaseUrl}/1`);
                break;
            case 3:
                r && r.package && r.email && r.password ? null : location.replace(`${this.registerBaseUrl}/1`);
                break;
            case 4:
                r && r.package && r.email && r.password && r.company_name ? null : location.replace(`${this.registerBaseUrl}/1`);
                break;
            case 5:
                r && r.package && r.email && r.password && r.company_name && r.map_address && r.map_postalCode ? null : location.replace(`${this.registerBaseUrl}/1`);
                break;

            default:
                break;
        }
    }

    // Pagination
    continueButton = (func) => {
        const button = document.querySelector(".c-register__formContinue");
        if (button) button.addEventListener("click", () => {
            if (func) func();
            location.replace(`${this.registerBaseUrl}/${getFormNumber() + 1}`)
        })
    }

    // Pagination
    previousButton = (func) => {
        const button = document.querySelector(".c-register__formPrevious");
        if (button) button.addEventListener("click", () => {
            if (func) func();
            location.replace(`${this.registerBaseUrl}/${getFormNumber() - 1}`)
        })
    }

    // Save user info on backend
    finishButton = (beforeSend) => {
        document.querySelector(".c-register__formFinish").addEventListener("click", (e) => {
            beforeSend();
            e.target.disabled = true;
            e.target.classList.add("disabled")
            const storage = JSON.parse(sessionStorage.getItem("reg_obj"))
            console.log(storage)

            getSessionInfo().then(session => {
                const params = new FormData();
                params.append("password", storage.password)
                params.append("email", storage.email)
                params.append("fullName", storage.company_name)
                params.append("fields[package]", storage.package)
                params.append("fields[phoneNumber]", storage.phone)
                params.append("fields[website]", storage.website)
                params.append("fields[instagram]", storage.instagram)
                params.append("fields[facebook]", storage.facebook)
                params.append("fields[vat]", storage.VAT)
                params.append("fields[invoiceCompanyName]", storage.invoice_name)
                params.append("fields[invoiceAddress]", storage.invoice_address)
                params.append("fields[invoiceZipCode]", storage.invoice_zip)
                params.append("fields[invoiceCity]", storage.invoice_city)
                params.append("fields[invoiceCountry]", storage.invoice_country)
                params.append("fields[mapAddress]", storage.map_address)
                params.append("fields[mapPostalCode]", storage.map_postalCode)

                return fetch('/actions/users/save-user', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-Token': session.csrfTokenValue,
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                    body: params,
                }).then(response => response.json()).then(result => {
                    e.target.disabled = false;
                    e.target.classList.remove("disabled")

                    // Handle register errors otherwise go to login page.
                    if (result.errors) {
                        handleErrorMessage(Object.values(result.errors), document.querySelector(".c-register__errors"))
                    } else {
                        sessionStorage.clear();
                        location.href = "/login"
                    }

                    return { ...session, userId: result.id }
                })
            })
        })
    }

    formOne = () => {
        this.continueButton();
        const packageButtons = document.querySelectorAll(".c-register__formPackageSelect")
        const continueButton = document.querySelector(".c-register__formContinue");

        packageButtons.forEach((button) => {
            // Check if there is already a package that's been selected in session storage
            if (sessionStorage.reg_obj && JSON.parse(sessionStorage.reg_obj).package === button.dataset.package) {
                button.classList.add("selected")
                button.parentElement.classList.add("selected")
            }

            // Upon clicking one of the select buttons set session storage and styling
            button.addEventListener("click", () => {
                const selected = document.querySelector(".c-register__formPackageSelect.selected");
                if (selected) {
                    selected.classList.remove("selected");
                    selected.innerHTML = "Select"
                    selected.parentElement.classList.remove("selected")
                }

                button.parentElement.classList.add("selected")
                button.classList.add("selected")
                button.innerHTML = "Selected <ion-icon name='checkmark-outline'></ion-icon>"

                if (sessionStorage.getItem("reg_obj")) {
                    const storage = JSON.parse(sessionStorage.getItem("reg_obj"))
                    const reg_obj = { ...storage, package: button.dataset.package }
                    sessionStorage.setItem("reg_obj", JSON.stringify(reg_obj))

                } else {
                    sessionStorage.setItem("reg_obj", JSON.stringify({ package: button.dataset.package }))
                }

                continueButton.disabled = false
                if (continueButton.classList.contains("disabled")) continueButton.classList.remove("disabled")
            })
        })

        // Validation for continue button
        const selected = document.querySelector(".c-register__formPackageSelect.selected");
        if (selected) {
            selected.innerHTML = "Selected <ion-icon name='checkmark-outline'></ion-icon>"
            continueButton.disabled = false
            continueButton.classList.remove("disabled")
        }

    }

    formTwo = () => {
        const save_form = () => {
            const storage = JSON.parse(sessionStorage.getItem("reg_obj"))
            const reg_obj = { ...storage, email: document.querySelector("#email").value.trim(), password: document.querySelector("#password").value.trim() }
            sessionStorage.setItem("reg_obj", JSON.stringify(reg_obj))
        }
        this.continueButton(save_form);
        this.previousButton(save_form);
        this.validate(2);

        const storage = JSON.parse(sessionStorage.getItem("reg_obj"))
        const passwordVisiblity = document.querySelector(".c-register__formPasswordVisiblity")
        const password = document.querySelector("#password")
        const email = document.querySelector("#email")
        const continueButton = document.querySelector(".c-register__formContinue");

        if (storage.email) email.value = storage.email;
        if (storage.password) password.value = storage.password;

        // Validate form fields before making continue button available
        const validateContinue = (firstRun = false) => {
            const reg = new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g).test(email.value)

            if (!firstRun) {
                validateFormField(".c-register__formLabel[for='email']", "Please fill in a valid email", reg, email.value.length > 0)
                validateFormField(".c-register__formLabel[for='password']", "Password has to be atleast 6 characters", password.value.length >= 6, password.value.length > 0)
            }

            if (password.value.length >= 6 && reg) {
                continueButton.disabled = false;
                continueButton.classList.remove("disabled")
            } else {
                continueButton.disabled = true;
                if (!continueButton.classList.contains("disabled")) continueButton.classList.add("disabled")
            }
        }

        email.addEventListener("keyup", () => validateContinue(false))
        password.addEventListener("keyup", () => validateContinue(false))
        validateContinue(true);

        passwordVisiblity.addEventListener('click', () => {
            const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
            const name = passwordVisiblity.getAttribute('name') === 'eye-off-outline' ? 'eye-outline' : 'eye-off-outline'
            password.setAttribute('type', type);
            passwordVisiblity.setAttribute('name', name)
        });
    }

    formThree = () => {
        const save_form = () => {
            const storage = JSON.parse(sessionStorage.getItem("reg_obj"))
            const reg_obj = {
                ...storage,
                company_name: document.querySelector("#companyname").value.trim(),
                phone: document.querySelector("#phone").value.trim(),
                instagram: document.querySelector("#instagram").value.trim(),
                website: document.querySelector("#website").value.trim(),
                facebook: document.querySelector("#facebook").value.trim(),
            }
            sessionStorage.setItem("reg_obj", JSON.stringify(reg_obj))
        }

        this.continueButton(save_form);
        this.previousButton(save_form);
        this.validate(3);

        const storage = JSON.parse(sessionStorage.getItem("reg_obj"))
        const company_name = document.querySelector("#companyname")
        const phone = document.querySelector("#phone")
        const instagram = document.querySelector("#instagram")
        const website = document.querySelector("#website")
        const facebook = document.querySelector("#facebook")
        const validated_fields = [company_name];

        if (storage.company_name) company_name.value = storage.company_name;
        if (storage.phone) phone.value = storage.phone;
        if (storage.instagram) instagram.value = storage.instagram;
        if (storage.website) website.value = storage.website;
        if (storage.facebook) facebook.value = storage.facebook;

        const validateContinue = (firstRun = false) => {
            const continueButton = document.querySelector(".c-register__formContinue");

            if (!firstRun) {
                validateFormField(".c-register__formLabel[for='companyname']", "Company name is required", company_name.value.length >= 1)
            }

            if (company_name.value.length >= 1) {
                continueButton.disabled = false;
                continueButton.classList.remove("disabled")
            } else {
                continueButton.disabled = true;
                if (!continueButton.classList.contains("disabled")) continueButton.classList.add("disabled")
            }
        }

        validated_fields.forEach(field => field.addEventListener("keyup", () => validateContinue(false)));
        validateContinue(true);
    }

    formFour = () => {
        const save_form = () => {
            const storage = JSON.parse(sessionStorage.getItem("reg_obj"))
            const reg_obj = {
                ...storage,
                map_address: document.querySelector("#mapaddress").value.trim(),
                map_postalCode: document.querySelector("#mappostalcode").value.trim()
            }
            sessionStorage.setItem("reg_obj", JSON.stringify(reg_obj))
        }

        this.previousButton(save_form);
        this.continueButton(save_form);
        this.validate(4);

        const storage = JSON.parse(sessionStorage.getItem("reg_obj"))
        const address = document.querySelector("#mapaddress")
        const postalCode = document.querySelector("#mappostalcode")
        const validated_fields = [address, postalCode];

        if (storage.map_address) address.value = storage.map_address;
        if (storage.map_postalCode) postalCode.value = storage.map_postalCode;

        const validateContinue = (firstRun = false) => {
            const continueButton = document.querySelector(".c-register__formContinue");

            if (!firstRun) {
                validateFormField(".c-register__formLabel[for='mapaddress']", "Valid address is required", address.value.length > 2, address.value.length > 0)
                validateFormField(".c-register__formLabel[for='mappostalcode']", "Valid Dutch postal code is required", /\d{4}[ ]?[A-Z]{2}/g.test(postalCode.value), postalCode.value.length > 0)
            }

            if (address.value.length > 2 && postalCode.value.length >= 1) {
                continueButton.disabled = false;
                continueButton.classList.remove("disabled")
            } else {
                continueButton.disabled = true;
                if (!continueButton.classList.contains("disabled")) continueButton.classList.add("disabled")
            }
        }

        validated_fields.forEach(field => field.addEventListener("keyup", () => validateContinue(false)));
        validateContinue(true);
    }

    formFive = () => {
        const save_form = () => {
            const storage = JSON.parse(sessionStorage.getItem("reg_obj"))
            const reg_obj = {
                ...storage,
                invoice_name: document.querySelector("#invoicename").value.trim(),
                invoice_zip: document.querySelector("#invoicezip").value.trim(),
                invoice_address: document.querySelector("#invoiceaddress").value.trim(),
                invoice_country: document.querySelector("#invoicecountry").value.trim(),
                invoice_city: document.querySelector("#invoicecity").value.trim(),
                VAT: document.querySelector("#VAT").value.trim(),
            }
            sessionStorage.setItem("reg_obj", JSON.stringify(reg_obj))
        }

        this.previousButton(save_form);
        this.finishButton(save_form);
        this.validate(5);

        const storage = JSON.parse(sessionStorage.getItem("reg_obj"))
        const name = document.querySelector("#invoicename")
        const zip = document.querySelector("#invoicezip")
        const address = document.querySelector("#invoiceaddress")
        const country = document.querySelector("#invoicecountry")
        const city = document.querySelector("#invoicecity")
        const VAT = document.querySelector("#VAT")
        const validated_fields = [name, zip, address, country, city];

        if (storage.invoice_name) name.value = storage.invoice_name;
        if (storage.invoice_zip) zip.value = storage.invoice_zip;
        if (storage.invoice_address) address.value = storage.invoice_address;
        if (storage.invoice_country) country.value = storage.invoice_country;
        if (storage.invoice_city) city.value = storage.invoice_city;
        if (storage.VAT) VAT.value = storage.VAT;

        const validateContinue = (firstRun = false) => {
            const finishButton = document.querySelector(".c-register__formFinish");

            if (!firstRun) {
                validateFormField(".c-register__formLabel[for='invoicename']", "Company name is required", name.value.length >= 1)
                validateFormField(".c-register__formLabel[for='invoicezip']", "Valid zip code is required", zip.value.length >= 4, zip.value.length > 0)
                validateFormField(".c-register__formLabel[for='invoiceaddress']", "Address is required", address.value.length > 1, address.value.length > 0)
                validateFormField(".c-register__formLabel[for='invoicecountry']", "Country is required", country.value.length > 1, country.value.length > 0)
                validateFormField(".c-register__formLabel[for='invoicecity']", "City is required", city.value.length > 1, city.value.length > 0)
            }

            if (name.value.length >= 1 && zip.value.length >= 1 && address.value.length >= 1 && country.value.length >= 1 && city.value.length >= 1) {
                finishButton.disabled = false;
                finishButton.classList.remove("disabled")
            } else {
                finishButton.disabled = true;
                if (!finishButton.classList.contains("disabled")) finishButton.classList.add("disabled")
            }
        }

        validated_fields.forEach(field => field.addEventListener("keyup", () => validateContinue(false)));
        validateContinue(true);
    }
}

new Register();
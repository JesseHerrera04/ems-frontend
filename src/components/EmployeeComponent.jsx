import React, {useEffect, useRef, useState} from 'react';
import {createEmployee, getEmployee, updateEmployee} from "../services/EmployeeService.js";
import {useNavigate, useParams} from "react-router-dom";

/**
 * EmployeeComponent
 * @returns {React.JSX.Element}
 * @constructor
 */
const EmployeeComponent = () => {

    // State variables to hold the employee details
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [department, setDepartment] = useState("");
    const [salary, setSalary] = useState("");
    const emailInputRef = useRef(null);

    // State variable to hold any validation errors
    const [error, setError] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        salary: ""
    });

    // Hook to navigate between pages
    const navigator = useNavigate();

    // Get the employee ID from the URL parameters
    const {id} = useParams();

    // Fetch employee details when the component mounts IF id is present (means update)
    useEffect(() => {
        if (id) {
            getEmployee(id).then((response) => {
                setFirstName(response.data.firstName);
                setLastName(response.data.lastName);
                setEmail(response.data.email);
                setPhone(response.data.phone);
                setDepartment(response.data.department ?? "");
                setSalary(response.data.salary == null ? "" : String(response.data.salary));
            }).catch((error) => {
                console.error("Error fetching employee details: ", error);
            });
        }
    }, [id])

    // Function to validate the form fields
    function validateForm() {

        let isValid = true; // Initialize isValid to true

        const errors = {...error}; // Create a copy of the error object

        // Validate the first name field
        if (!firstName.trim()) {
            errors.firstName = "First name is required";
            isValid = false;
        } else {
            errors.firstName = "";
        }

        // Validate the last name field
        if (!lastName.trim()) {
            errors.lastName = "Last name is required";
            isValid = false;
        } else {
            errors.lastName = "";
        }

        // Validate the email field
        if (!email.trim()) {
            errors.email = "Email is required";
            isValid = false;
        } else if (!emailInputRef.current?.validity.valid) {
            errors.email = "Enter a valid email address";
            isValid = false;
        } else {
            errors.email = "";
        }

        // Validate the phone field
        if (!phone.trim()) {
            errors.phone = "Phone is required";
            isValid = false;
        } else if (!/^\+1[2-9]\d{2}[2-9]\d{6}$/.test(phone)) {
            errors.phone = "Enter a US or Canada phone number in E.164 format (for example, +12025550123)";
            isValid = false;
        } else {
            errors.phone = "";
        }

        if (salary.trim() && !Number.isInteger(Number(salary))) {
            errors.salary = "Salary must be a whole number";
            isValid = false;
        } else {
            errors.salary = "";
        }

        setError(errors); // Update the error state with the new validation results

        return isValid; // Return the validation result
    }

    // Function to save the employee details and send POST request to the backend
    const saveOrUpdateEmployee = (e) => {
        e.preventDefault(); // Prevent the default form submission behavior

        // Create an employee object with the entered details
        const employee = {
            firstName,
            lastName,
            email: email.trim(),
            phone,
            department: department.trim() || null,
            salary: salary.trim() ? Number(salary) : null
        };
        console.log("Saving employee with below details");
        console.log(employee); // Log the employee object to the console

        // Validate the form fields before sending the POST request
        if (validateForm()) {
            if (id) {
                // Send PUT request to the backend to update the employee
                updateEmployee(id, employee).then((response) => {
                    console.log("Employee updated successfully: ", response.data);
                    navigator('/employees');
                }).catch((error) => {
                    console.error("Error updating employee: ", error);
                });
            } else {
                // Send POST request to the backend to save the employee
                createEmployee(employee).then((response) => {
                    console.log("Employee saved successfully: ", response.data);
                    navigator('/employees'); // Navigate back to the list of employees
                }).catch((error) => {
                    console.error("Error saving employee: ", error);
                });
            }
        }
    }

    function setPageTitle() {
        if (id) {
            return <h2 className={"text-center"}>Update Employee</h2>;
        } else {
            return <h2 className={"text-center"}>Add Employee</h2>;
        }
    }

    return (
        <div className={"container"}>
            <div className={"row"}>
                <div className={"card col-md-6 offset-md-3 mt-5"}>
                    <div className={"card-header"}>
                        {setPageTitle()}
                    </div>
                    <div className={"card-body"}>
                        <form noValidate onSubmit={saveOrUpdateEmployee}>
                            <div className={"form-group mb-2"}>
                                <label className={"form-label"} htmlFor={"firstName"}>First Name</label>
                                <input
                                    id={"firstName"}
                                    type={"text"}
                                    className={`form-control ${error.firstName ? "is-invalid" : ""}`}
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                                {error.firstName && <div className={"invalid-feedback"}>{error.firstName}</div>}
                                <label className={"form-label"} htmlFor={"lastName"}>Last Name</label>
                                <input
                                    id={"lastName"}
                                    type={"text"}
                                    className={`form-control ${error.lastName ? "is-invalid" : ""}`}
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                                {error.lastName && <div className={"invalid-feedback"}>{error.lastName}</div>}
                                <label className={"form-label"} htmlFor={"email"}>Email</label>
                                <input
                                    id={"email"}
                                    ref={emailInputRef}
                                    type={"email"}
                                    className={`form-control ${error.email ? "is-invalid" : ""}`}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                {error.email && <div className={"invalid-feedback"}>{error.email}</div>}
                                <label className={"form-label"} htmlFor={"phone"}>Phone</label>
                                <input
                                    id={"phone"}
                                    type={"text"}
                                    className={`form-control ${error.phone ? "is-invalid" : ""}`}
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                {error.phone && <div className={"invalid-feedback"}>{error.phone}</div>}
                                <label className={"form-label"} htmlFor={"department"}>Department</label>
                                <input
                                    id={"department"}
                                    type={"text"}
                                    className={"form-control"}
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                />
                                <label className={"form-label"} htmlFor={"salary"}>Salary</label>
                                <input
                                    id={"salary"}
                                    type={"number"}
                                    step={"1"}
                                    className={`form-control ${error.salary ? "is-invalid" : ""}`}
                                    value={salary}
                                    onChange={(e) => setSalary(e.target.value)}
                                />
                                {error.salary && <div className={"invalid-feedback"}>{error.salary}</div>}
                            </div>
                            <button type={"submit"} className={"btn btn-success"}>
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeeComponent;
import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {beforeEach, describe, expect, it, vi} from "vitest";
import EmployeeComponent from "../../components/EmployeeComponent.jsx";
import {createEmployee, getEmployee, updateEmployee} from "../../services/EmployeeService.js";

vi.mock("../../services/EmployeeService.js", () => ({
    createEmployee: vi.fn(),
    getEmployee: vi.fn(),
    updateEmployee: vi.fn(),
}));

function EmployeeListRoute() {
    return <div>Employee list page</div>;
}

function renderEmployeeForm(initialEntry = "/add-employee") {
    return render(
        <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
                <Route path="/add-employee" element={<EmployeeComponent/>}/>
                <Route path="/edit-employee/:id" element={<EmployeeComponent/>}/>
                <Route path="/employees" element={<EmployeeListRoute/>}/>
            </Routes>
        </MemoryRouter>
    );
}

async function fillValidEmployee(user, {department = "Engineering", salary = "90000"} = {}) {
    await user.type(screen.getByLabelText("First Name"), "Ada");
    await user.type(screen.getByLabelText("Last Name"), "Lovelace");
    await user.type(screen.getByLabelText("Email"), "ada@example.com");
    await user.type(screen.getByLabelText("Phone"), "+12025550123");
    if (department) {
        await user.type(screen.getByLabelText("Department"), department);
    }
    if (salary) {
        await user.type(screen.getByLabelText("Salary"), salary);
    }
}

describe("EmployeeComponent", () => {
    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => {});
        createEmployee.mockResolvedValue({data: {}});
        getEmployee.mockResolvedValue({
            data: {
                id: 7,
                firstName: "Ada",
                lastName: "Lovelace",
                email: "ada@example.com",
                phone: "+12025550123",
                department: null,
                salary: null,
            },
        });
        updateEmployee.mockResolvedValue({data: {}});
    });

    it("blocks submission when required fields are missing", async () => {
        const user = userEvent.setup();
        renderEmployeeForm();

        // Given (initial condition/param/state): The add form starts with all fields blank.
        // When (action that occurs): The user submits the form.
        await user.click(screen.getByRole("button", {name: "Submit"}));

        // Then (expected result): Required-field errors appear and no create request is sent.
        expect(await screen.findByText("First name is required")).toBeInTheDocument();
        expect(screen.getByText("Last name is required")).toBeInTheDocument();
        expect(screen.getByText("Email is required")).toBeInTheDocument();
        expect(screen.getByText("Phone is required")).toBeInTheDocument();
        expect(createEmployee).not.toHaveBeenCalled();
    });

    it.each([
        ["invalid email", "Email", "not-an-email", "Enter a valid email address"],
        [
            "invalid phone",
            "Phone",
            "2025550123",
            "Enter a US or Canada phone number in E.164 format (for example, +12025550123)",
        ],
    ])("blocks submission for %s", async (_caseName, field, invalidValue, errorMessage) => {
        const user = userEvent.setup();
        renderEmployeeForm();
        await fillValidEmployee(user);
        await user.clear(screen.getByLabelText(field));
        await user.type(screen.getByLabelText(field), invalidValue);

        // Given (initial condition/param/state): All fields are valid except the specified field.
        // When (action that occurs): The user submits the form.
        await user.click(screen.getByRole("button", {name: "Submit"}));

        // Then (expected result): The field error appears and the API is not called.
        expect(await screen.findByText(errorMessage)).toBeInTheDocument();
        expect(createEmployee).not.toHaveBeenCalled();
    });

    it("creates an employee with null optional fields when they are blank", async () => {
        const user = userEvent.setup();
        renderEmployeeForm();
        await fillValidEmployee(user, {department: "", salary: ""});

        // Given (initial condition/param/state): Required values are valid and department/salary are blank.
        // When (action that occurs): The user submits the add form.
        await user.click(screen.getByRole("button", {name: "Submit"}));

        // Then (expected result): The create request uses null optional values and navigates to the list.
        await waitFor(() => expect(createEmployee).toHaveBeenCalledWith({
            firstName: "Ada",
            lastName: "Lovelace",
            email: "ada@example.com",
            phone: "+12025550123",
            department: null,
            salary: null,
        }));
        expect(await screen.findByText("Employee list page")).toBeInTheDocument();
    });

    it("trims department and converts a provided whole-number salary to a number", async () => {
        const user = userEvent.setup();
        renderEmployeeForm();
        await fillValidEmployee(user, {department: "  Engineering  ", salary: "90000"});

        // Given (initial condition/param/state): Required values and optional department/salary are entered.
        // When (action that occurs): The user submits the add form.
        await user.click(screen.getByRole("button", {name: "Submit"}));

        // Then (expected result): The payload contains a trimmed department and integer salary.
        await waitFor(() => expect(createEmployee).toHaveBeenCalledWith(expect.objectContaining({
            department: "Engineering",
            salary: 90000,
        })));
    });

    it("rejects a decimal salary", async () => {
        const user = userEvent.setup();
        renderEmployeeForm();
        await fillValidEmployee(user, {salary: "90000.5"});

        // Given (initial condition/param/state): Required values are valid and salary contains a decimal.
        // When (action that occurs): The user submits the add form.
        await user.click(screen.getByRole("button", {name: "Submit"}));

        // Then (expected result): A whole-number error appears and no create request is sent.
        expect(await screen.findByText("Salary must be a whole number")).toBeInTheDocument();
        expect(createEmployee).not.toHaveBeenCalled();
    });

    it("loads an employee and submits an update in edit mode", async () => {
        const user = userEvent.setup();
        renderEmployeeForm("/edit-employee/7");

        // Given (initial condition/param/state): Edit mode loads employee 7, with null optional values.
        await waitFor(() => expect(getEmployee).toHaveBeenCalledWith("7"));
        await waitFor(() => {
            expect(screen.getByLabelText("First Name")).toHaveValue("Ada");
            expect(screen.getByLabelText("Department")).toHaveValue("");
            expect(screen.getByLabelText("Salary")).toHaveValue(null);
        });

        // When (action that occurs): The user submits the loaded employee without changing its values.
        await user.click(screen.getByRole("button", {name: "Submit"}));

        // Then (expected result): The update request preserves null optional values and returns to the list.
        await waitFor(() => expect(updateEmployee).toHaveBeenCalledWith("7", expect.objectContaining({
            department: null,
            salary: null,
        })));
        expect(await screen.findByText("Employee list page")).toBeInTheDocument();
    });

    it("does not submit whitespace-only names", async () => {
        const user = userEvent.setup();
        renderEmployeeForm();
        await user.type(screen.getByLabelText("First Name"), "   ");
        await user.type(screen.getByLabelText("Last Name"), "   ");
        await user.type(screen.getByLabelText("Email"), "ada@example.com");
        await user.type(screen.getByLabelText("Phone"), "+12025550123");

        // Given (initial condition/param/state): Names contain only whitespace and other required values are valid.
        // When (action that occurs): The user submits the form.
        await user.click(screen.getByRole("button", {name: "Submit"}));

        // Then (expected result): Both name errors appear and no create request is sent.
        expect(await screen.findByText("First name is required")).toBeInTheDocument();
        expect(screen.getByText("Last name is required")).toBeInTheDocument();
        expect(createEmployee).not.toHaveBeenCalled();
    });
});

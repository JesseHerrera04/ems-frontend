import React from "react";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {MemoryRouter, Route, Routes, useParams} from "react-router-dom";
import {beforeEach, describe, expect, it, vi} from "vitest";
import ListEmployeeComponent from "../../components/ListEmployeeComponent.jsx";
import {deleteEmployee, listEmployees} from "../../services/EmployeeService.js";

vi.mock("../../services/EmployeeService.js", () => ({
    deleteEmployee: vi.fn(),
    listEmployees: vi.fn(),
}));

function EditRoute() {
    const {id} = useParams();
    return <div>Editing employee {id}</div>;
}

function renderEmployeeList() {
    return render(
        <MemoryRouter initialEntries={["/employees"]}>
            <Routes>
                <Route path="/employees" element={<ListEmployeeComponent/>}/>
                <Route path="/edit-employee/:id" element={<EditRoute/>}/>
                <Route path="/add-employee" element={<div>Add employee page</div>}/>
            </Routes>
        </MemoryRouter>
    );
}

const employee = {
    id: 7,
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phone: "+12025550123",
    department: "Engineering",
    salary: 90000,
};

describe("ListEmployeeComponent", () => {
    beforeEach(() => {
        vi.spyOn(console, "log").mockImplementation(() => {});
        listEmployees.mockResolvedValue({data: [employee]});
        deleteEmployee.mockResolvedValue({status: 204});
    });

    it("displays employee fields and placeholders for blank nullable fields", async () => {
        listEmployees.mockResolvedValueOnce({
            data: [
                employee,
                {...employee, id: 8, firstName: "Grace", department: " ", salary: ""},
            ],
        });
        renderEmployeeList();

        // Given (initial condition/param/state): The API returns one complete employee and one with blank optional values.
        // When (action that occurs): The employee list loads.
        const adaRow = await screen.findByRole("row", {name: /Ada Lovelace/});
        const graceRow = screen.getByRole("row", {name: /Grace Lovelace/});

        // Then (expected result): Values display in the correct columns and blanks use em-dash placeholders.
        expect(within(adaRow).getByText("Engineering")).toBeInTheDocument();
        expect(within(adaRow).getByText("90000")).toBeInTheDocument();
        expect(within(graceRow).getAllByText("—")).toHaveLength(2);
    });

    it("navigates to the selected employee's edit route", async () => {
        const user = userEvent.setup();
        renderEmployeeList();
        const row = await screen.findByRole("row", {name: /Ada Lovelace/});

        // Given (initial condition/param/state): Employee 7 is displayed in the list.
        // When (action that occurs): The user selects its Update button.
        await user.click(within(row).getByRole("button", {name: "Update"}));

        // Then (expected result): The application navigates to employee 7's edit route.
        expect(await screen.findByText("Editing employee 7")).toBeInTheDocument();
    });

    it("deletes the selected employee and reloads the list", async () => {
        const user = userEvent.setup();
        listEmployees
            .mockResolvedValueOnce({data: [employee]})
            .mockResolvedValueOnce({data: []});
        renderEmployeeList();
        const row = await screen.findByRole("row", {name: /Ada Lovelace/});

        // Given (initial condition/param/state): Employee 7 is displayed and delete succeeds.
        // When (action that occurs): The user selects its Delete button.
        await user.click(within(row).getByRole("button", {name: "Delete"}));

        // Then (expected result): Employee 7 is deleted and the refreshed table no longer contains it.
        await waitFor(() => expect(deleteEmployee).toHaveBeenCalledWith(7));
        await waitFor(() => expect(listEmployees).toHaveBeenCalledTimes(2));
        expect(screen.queryByRole("row", {name: /Ada Lovelace/})).not.toBeInTheDocument();
    });

    it("navigates to the add-employee form", async () => {
        const user = userEvent.setup();
        renderEmployeeList();

        // Given (initial condition/param/state): The employee list is displayed.
        // When (action that occurs): The user selects Add Employee.
        await user.click(screen.getByRole("button", {name: "Add Employee"}));

        // Then (expected result): The application navigates to the add-employee route.
        expect(await screen.findByText("Add employee page")).toBeInTheDocument();
    });
});

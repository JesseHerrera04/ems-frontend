import axios from "axios";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {
    createEmployee,
    deleteEmployee,
    getEmployee,
    listEmployees,
    updateEmployee,
} from "../../services/EmployeeService.js";

vi.mock("axios", () => ({
    default: {
        delete: vi.fn(),
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
    },
}));

const baseUrl = "http://localhost:8080/api/employees";

describe("EmployeeService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("requests the employee list", () => {
        // Given (initial condition/param/state): Axios is mocked and the employee service is available.
        // When (action that occurs): The list operation is called.
        listEmployees();

        // Then (expected result): The service sends GET to the collection endpoint.
        expect(axios.get).toHaveBeenCalledWith(baseUrl);
    });

    it("creates an employee with the supplied payload", () => {
        const payload = {firstName: "Ada", department: null, salary: null};

        // Given (initial condition/param/state): An employee payload is prepared.
        // When (action that occurs): The create operation is called.
        createEmployee(payload);

        // Then (expected result): The service sends POST with that payload to the collection endpoint.
        expect(axios.post).toHaveBeenCalledWith(baseUrl, payload);
    });

    it("requests an employee by ID", () => {
        // Given (initial condition/param/state): Employee ID 7 is supplied.
        // When (action that occurs): The get operation is called.
        getEmployee(7);

        // Then (expected result): The service sends GET to the employee-specific endpoint.
        expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/7`);
    });

    it("updates an employee by ID with the supplied payload", () => {
        const payload = {firstName: "Ada", salary: 90000};

        // Given (initial condition/param/state): Employee ID 7 and an update payload are supplied.
        // When (action that occurs): The update operation is called.
        updateEmployee(7, payload);

        // Then (expected result): The service sends PUT to the employee endpoint with that payload.
        expect(axios.put).toHaveBeenCalledWith(`${baseUrl}/7`, payload);
    });

    it("deletes an employee by ID", () => {
        // Given (initial condition/param/state): Employee ID 7 is supplied.
        // When (action that occurs): The delete operation is called.
        deleteEmployee(7);

        // Then (expected result): The service sends DELETE to the employee-specific endpoint.
        expect(axios.delete).toHaveBeenCalledWith(`${baseUrl}/7`);
    });

    it("requires an API URL for production", async () => {
        vi.stubEnv("PROD", true);
        vi.stubEnv("VITE_API_BASE_URL", "");
        vi.resetModules();

        // Given (initial condition/param/state): Production mode has no API URL configured.
        // When (action that occurs): The employee service module is loaded.
        // Then (expected result): Loading fails with a clear configuration error.
        await expect(import("../../services/EmployeeService.js"))
            .rejects.toThrow("VITE_API_BASE_URL must be configured for production");
    });
});

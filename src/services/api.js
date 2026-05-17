"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
// src/services/api.ts
var axios_1 = require("axios");
var API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
exports.api = axios_1.default.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});
// Request Interceptor
exports.api.interceptors.request.use(function (config) {
    var token = sessionStorage.getItem("authToken");
    if (token && config.headers) {
        config.headers.Authorization = "Bearer ".concat(token);
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});
// Response Interceptor
exports.api.interceptors.response.use(function (response) { return response; }, function (error) {
    var _a, _b, _c;
    var status = (_a = error.response) === null || _a === void 0 ? void 0 : _a.status;
    var message = (_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message;
    if (status === 401 ||
        (status === 404 && (message === null || message === void 0 ? void 0 : message.includes("User with ID")))) {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("user");
        window.location.href = "/login";
    }
    return Promise.reject(error);
});

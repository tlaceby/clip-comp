"use strict";
var app = window.api;
// DOM ELEMENTS 
var LOADING = document.getElementById("loading") || document.createElement("div");
var DASHBOARD = document.getElementById("dashboard") || document.createElement("div");
var NEW_WORK_PAGE = document.getElementById("add-work") || document.createElement("div");
var SETTINGS = document.getElementById("settings") || document.createElement("div");
// New Work Form DOM
var SELECT_FOLDER_DIV = document.getElementById("select-folder-btn-area") || document.createElement("div");
var NEW_WORK_FORM_FIELDS = document.getElementById("new-file-settings") || document.createElement("div");
var NEW_FORM_H1 = document.getElementById("new-form-header") || document.createElement("div");
// Page Navigation
function hidePages() {
    DASHBOARD.style.display = "none";
    NEW_WORK_PAGE.style.display = "none";
    SETTINGS.style.display = "none";
}
function toNewWork() {
    hidePages();
    if (NEW_WORK_PAGE)
        NEW_WORK_PAGE.style.display = "block";
}
function toDashboard() {
    hidePages();
    if (DASHBOARD)
        DASHBOARD.style.display = "block";
}

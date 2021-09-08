const app = window.api;


// DOM ELEMENTS 
const LOADING = document.getElementById("loading") || document.createElement("div");
const DASHBOARD = document.getElementById("dashboard") || document.createElement("div");
const NEW_WORK_PAGE = document.getElementById("add-work") || document.createElement("div");
const SETTINGS = document.getElementById("settings") || document.createElement("div");

// New Work Form DOM
const SELECT_FOLDER_DIV = document.getElementById("select-folder-btn-area") || document.createElement("div")
const NEW_WORK_FORM_FIELDS = document.getElementById("new-file-settings") || document.createElement("div");
const NEW_FORM_H1 = document.getElementById("new-form-header") || document.createElement("div")

// Page Navigation


function hidePages () {   
    DASHBOARD.style.display = "none";
    NEW_WORK_PAGE.style.display = "none";
    SETTINGS.style.display = "none";
}

function toNewWork () {
    hidePages();
    if (NEW_WORK_PAGE) NEW_WORK_PAGE.style.display = "block";
}

function toDashboard () {
    hidePages();
    if (DASHBOARD) DASHBOARD.style.display = "block";
}
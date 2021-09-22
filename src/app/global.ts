/**
 * Clipz contains a API which can be used by the renderer process to securely
 * communicate with the main process without revealing private and vulnerable
 * information to the wrong process.
 * 
 * In here contains the required functions and methods for interacting with the 
 * IPC Safely.
 */
const app = window.api;

/////////////////////
//// DOM ELEMENTS //
///////////////////

const LOADING = document.getElementById("loading") as HTMLElement;
const DASHBOARD = document.getElementById("dashboard") as HTMLElement;
const NEW_WORK_PAGE = document.getElementById("add-work") as HTMLElement;
const SETTINGS = document.getElementById("settings") as HTMLElement;

const back_btn_frm = document.getElementById("back-btn-new-form") as HTMLElement;
const SELECT_FOLDER_DIV = document.getElementById("select-folder-btn-area") as HTMLElement;
const NEW_WORK_FORM_FIELDS = document.getElementById("new-file-settings")as HTMLElement;
const NEW_FORM_H1 = document.getElementById("new-form-header") as HTMLElement;

// Loading and Progress
const LOADING_HINT_TEXT = document.getElementById("loader-hint") as HTMLElement;
const LOADING_BAR_OUTER = document.getElementById("progress-install") as HTMLElement;
const LOADING_BAR_INNER = document.getElementById("progress-inner-install") as HTMLElement;


const EDITOR = document.getElementById("editor") as HTMLElement;
const PRE_EDITOR = document.getElementById("pre-edit") as HTMLElement;
const POST_EDITOR = document.getElementById("post-edit") as HTMLElement;
/////////////////////////
//// PAGE TRANSITIONS //
///////////////////////

/**
 * Hides and applies a display: hidden; style to each DOM element.
 */
function hidePages () {   
    DASHBOARD.style.display = "none";
    NEW_WORK_PAGE.style.display = "none";
    SETTINGS.style.display = "none";
    EDITOR.style.display = "none";
    hideEditorPages();
}

/**
 * Hides all page major page sections and shows the paghe for new work.
 */
function toNewWork () {
    hidePages();
    if (NEW_WORK_PAGE) NEW_WORK_PAGE.style.display = "block";
}

/**
 * Editor menu page transition.
 */
 function toEditor () {
    hidePages();
    if (EDITOR) EDITOR.style.display = "block";
    PRE_EDITOR.style.display = "block";
}

/**
 * Hides all pages and shows the dashboard page.
 * Though this shows the page there is no need to do a full DOM Draw call
 * as the content was never erased and only displayed: none.
 */
function toDashboard () {
    hidePages();
    if (DASHBOARD) DASHBOARD.style.display = "block";
}

/**
 * Hides all page major page sections and shows the settings page.
 * This will not re-draw the entire page or have much computation needed. It simply
 * shows the page and hides the others.
 */
function toSettings () {
    hidePages();
    if (SETTINGS) SETTINGS.style.display = "block";
}

/**
 * Cleares all JSON storage for the users application. This is mainly used if the user
 * is having problems with the binaries as the locations to those files is stores in 
 * storage.
 * 
 * It is not recomended that users use this function as they will have to reinstall
 * the binaries upon launch of the application again.
 */
function clearStorage() {
    app.app.clearStorage();
}


//////// EDITOR PAGE TRANSITIONS

function hideEditorPages () {
    PRE_EDITOR.style.display = "none";
    POST_EDITOR.style.display = "none";
}

function showPostEditor () {
    hideEditorPages();
    POST_EDITOR.style.display = "block";
}

function showPreEditor () {
    hideEditorPages();
    PRE_EDITOR.style.display = "block";
}
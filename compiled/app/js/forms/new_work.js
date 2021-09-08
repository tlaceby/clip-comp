"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var back_btn_frm = document.getElementById("back-btn-new-form") || document.createElement("span");
var SELECTED_FILES = document.getElementById("selected") || document.createElement("div");
var START_WORK_BTN = document.getElementById("start-work") || document.createElement("button");
var new_work_selected_paths = [];
var currentSettingsState = {
    bitrate: 29,
    ext: "--compressed",
    mute: false,
    new_path: undefined
};
function changeBitrate() {
    var bitrate = document.getElementById("bitrate");
    // @ts-ignore
    if (bitrate && bitrate.value < 55 && bitrate.value > 10) {
        // @ts-ignore
        currentSettingsState.bitrate = parseInt(bitrate.value);
        if (typeof currentSettingsState.bitrate !== "number")
            alert("must be number");
        allowStart();
    }
}
function select_destination() {
    return __awaiter(this, void 0, void 0, function () {
        var destination, folder_label;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.files.selectFolder()];
                case 1:
                    destination = _a.sent();
                    if (destination) {
                        currentSettingsState.new_path = destination[0];
                        folder_label = document.getElementById("select-folder-label");
                        if (folder_label) {
                            folder_label.innerText = "Compressed Destination: " + destination[0];
                            allowStart();
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function togglemuteBtn() {
    var mutebtn = document.getElementById("mute");
    // @ts-ignore
    if (mutebtn && mutebtn.checked) {
        currentSettingsState.mute = true;
    }
    else
        currentSettingsState.mute = false;
    allowStart();
}
function selectFilesButton() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, app.files.selectVideoFiles()];
                case 1:
                    new_work_selected_paths = _a.sent();
                    if (new_work_selected_paths.length > 0)
                        showNewWorkForm();
                    else
                        return [2 /*return*/];
                    return [2 /*return*/];
            }
        });
    });
}
function showNewWorkForm() {
    SELECTED_FILES.innerHTML = '';
    var newHeader = document.createElement("h3");
    newHeader.innerText = "Selected Files: [" + new_work_selected_paths.length + "]";
    newHeader.classList.add("file-count");
    SELECTED_FILES.appendChild(newHeader);
    SELECTED_FILES.appendChild(document.createElement("span"));
    NEW_WORK_FORM_FIELDS.style.display = "block";
    SELECT_FOLDER_DIV.style.display = "none";
    NEW_FORM_H1.innerText = "Customize Compression Settings";
    // new_work_selected_paths.forEach((file) => show_selected_file_card(file));
}
function clearNewWorkForm() {
    NEW_WORK_FORM_FIELDS.style.display = "none";
    SELECT_FOLDER_DIV.style.display = "flex";
    new_work_selected_paths = [];
    NEW_FORM_H1.innerText = "Select Files to Compress";
    currentSettingsState = {
        bitrate: 5000,
        ext: "--compressed",
        mute: false,
        new_path: undefined
    };
}
function show_selected_file_card(file) {
    var card = document.createElement("div");
    card.classList.add("file-selected-card");
    var size = document.createElement("p");
    size.classList.add("small-txt");
    size.innerText = "" + file.size_mb;
    var path = document.createElement("p");
    path.classList.add("small-txt");
    path.innerText = "" + file.name;
    card.appendChild(path);
    card.appendChild(size);
    SELECTED_FILES.appendChild(card);
}
// back btn click
back_btn_frm.addEventListener("click", clearNewWorkForm);
function allowStart() {
    if (currentSettingsState.new_path) {
        START_WORK_BTN.classList.remove("dissabled-start-btn");
        START_WORK_BTN.classList.add("active-start-btn");
        console.log(currentSettingsState);
        return true;
    }
    else {
        START_WORK_BTN.classList.add("dissabled-start-btn");
        START_WORK_BTN.classList.remove("active-start-btn");
        return false;
    }
}
function start_work() {
    return __awaiter(this, void 0, void 0, function () {
        var workArray, _i, new_work_selected_paths_1, o, newWorkerObject, addedFiles;
        return __generator(this, function (_a) {
            if (!allowStart())
                return [2 /*return*/];
            workArray = [];
            for (_i = 0, new_work_selected_paths_1 = new_work_selected_paths; _i < new_work_selected_paths_1.length; _i++) {
                o = new_work_selected_paths_1[_i];
                newWorkerObject = {
                    file: o,
                    settings: currentSettingsState,
                    id: generateUiqueID(40)
                };
                workArray.push(newWorkerObject);
            }
            addedFiles = app.compress.addWork(workArray);
            // success
            addedFiles.then(function () {
                toDashboard();
                clearNewWorkForm();
                allowStart();
            });
            addedFiles.catch(function (err) {
                console.error(err);
                clearNewWorkForm();
                toDashboard();
                allowStart();
                setTimeout(function () { return alert("There was an issue with adding the files to the queue."); }, 1000);
            });
            return [2 /*return*/];
        });
    });
}
function generateUiqueID(length) {
    var id = Date.now().toString();
    var allowed_chars = 'abcdefghijklmnop-qrstuvwxyz1234567890';
    for (var i = 0; i < length; i++) {
        var rd_index = Math.floor(Math.random() * (Math.floor(allowed_chars.length) - Math.ceil(0) + 1) + Math.ceil(0));
        id += allowed_chars[rd_index];
    }
    return id;
}

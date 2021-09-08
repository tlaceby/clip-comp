const back_btn_frm = document.getElementById("back-btn-new-form") || document.createElement("span");
const SELECTED_FILES = document.getElementById("selected") || document.createElement("div");
const START_WORK_BTN = document.getElementById("start-work") || document.createElement("button");


let new_work_selected_paths: FileDetails[] = [];
let currentSettingsState: CompressionSettings = {
    bitrate: 29, 
    ext: "--compressed", 
    mute: false,
    new_path: undefined
}

function changeBitrate () {
    const bitrate = document.getElementById("bitrate");
    // @ts-ignore
    if (bitrate && bitrate.value < 55 && bitrate.value > 10) {
        // @ts-ignore
        currentSettingsState.bitrate = parseInt(bitrate.value);

        if (typeof currentSettingsState.bitrate !== "number") alert("must be number")
        allowStart()
    }
}

async function select_destination() {
    let destination: string | undefined = await app.files.selectFolder();
    if (destination) {
        currentSettingsState.new_path = destination[0];
        const folder_label = document.getElementById("select-folder-label");
        if (folder_label) {
            folder_label.innerText = `Compressed Destination: ${destination[0]}`;
            allowStart()
        }
    }
}

function togglemuteBtn() {
    const mutebtn = document.getElementById("mute");
    // @ts-ignore
    if (mutebtn && mutebtn.checked) {
        currentSettingsState.mute = true;
    }
    else currentSettingsState.mute = false;

    allowStart()
}
async function selectFilesButton () {
    new_work_selected_paths = await app.files.selectVideoFiles();

    if (new_work_selected_paths.length > 0) showNewWorkForm()
    else return;
}


function showNewWorkForm () {
    SELECTED_FILES.innerHTML = '';
    const newHeader = document.createElement("h3");
    newHeader.innerText = `Selected Files: [${new_work_selected_paths.length}]`;
    newHeader.classList.add("file-count")
    SELECTED_FILES.appendChild(newHeader)
    SELECTED_FILES.appendChild(document.createElement("span"))
    NEW_WORK_FORM_FIELDS.style.display = "block";
    SELECT_FOLDER_DIV.style.display = "none"
    NEW_FORM_H1.innerText = "Customize Compression Settings";

    // new_work_selected_paths.forEach((file) => show_selected_file_card(file));

}


function clearNewWorkForm () {
    NEW_WORK_FORM_FIELDS.style.display = "none";
    SELECT_FOLDER_DIV.style.display = "flex"
    new_work_selected_paths = [];
    NEW_FORM_H1.innerText = "Select Files to Compress";

    currentSettingsState = {
        bitrate: 5000, 
        ext: "--compressed", 
        mute: false,
        new_path: undefined
    }
}

function show_selected_file_card (file: FileDetails) {
    const card = document.createElement("div");
    card.classList.add("file-selected-card");

    const size = document.createElement("p");
    size.classList.add("small-txt");
    size.innerText = `${file.size_mb}`;

    const path = document.createElement("p");
    path.classList.add("small-txt")
    path.innerText = `${file.name}`;

    card.appendChild(path);
    card.appendChild(size);

    SELECTED_FILES.appendChild(card);

}
// back btn click
back_btn_frm.addEventListener("click", clearNewWorkForm)



function allowStart () {
    if (currentSettingsState.new_path) {
        START_WORK_BTN.classList.remove("dissabled-start-btn");
        START_WORK_BTN.classList.add("active-start-btn");
        console.log(currentSettingsState)
        return true;
    } else {
        START_WORK_BTN.classList.add("dissabled-start-btn");
        START_WORK_BTN.classList.remove("active-start-btn");
        return false;
    }
}


async function start_work () {
    if (!allowStart()) return;
    const workArray: WorkProperties[] = [];

    for (let o of new_work_selected_paths) {
        let newWorkerObject: WorkProperties = {
            file: o,
            settings: currentSettingsState,
            id: generateUiqueID (40)
        }

        workArray.push(newWorkerObject);
    }

    let addedFiles = app.compress.addWork(workArray);

    // success
    addedFiles.then(() => {
        toDashboard()
        clearNewWorkForm();
        allowStart()
    })

    addedFiles.catch((err) => {
        console.error(err);
        clearNewWorkForm();
        toDashboard();
        allowStart()

        setTimeout(() => alert("There was an issue with adding the files to the queue."), 1000)
    });
}

function generateUiqueID (length: number) {

    let id = Date.now().toString();
    const allowed_chars = 'abcdefghijklmnop-qrstuvwxyz1234567890';

    for (let i = 0; i < length; i++) {
        let rd_index = Math.floor(Math.random() * (Math.floor(allowed_chars.length) - Math.ceil(0) + 1) + Math.ceil(0));
        id += allowed_chars[rd_index];
    }
    

    return id;
}


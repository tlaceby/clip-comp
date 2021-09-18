const STATUS_DIV = document.getElementById("status-div") || document.createElement("div");
app.compress.on("/work-update/starting-new", updateDashboardView);
app.compress.on("/work-update/all-done", allDone);
app.compress.on("/update-progress", updateProgressBar);

// allow the user to opt in to messages from the console to
// see whats going on withn your app in real time.
app.app.onLog((msg: any, type: ipcLog, alertMessage: boolean) => {
    if (localStorage.getItem("show-ipc-logs") === "true") {
        if (type == "vital") { console.error(`IPC Vital: \n`); console.error(msg); }
        if (type == "default") { console.log (msg); }
    }
    if (type == "error") { console.error(msg);}
    if (alertMessage) alert(msg);
});

function updateDashboardView (queue: WorkProperties[]) {

    STATUS_DIV.innerHTML = '';

    const currently_being_worked = currentlyBeingWorkedCard(queue[0]);
    STATUS_DIV.appendChild(currently_being_worked);
    // generate the new card for each piece of work in the queue
    queue.forEach((work, index) => {
        if (index > 0) 
        STATUS_DIV.appendChild(generateWorkCardStatus(work, index));
    });
}

function generateWorkCardStatus (work: WorkProperties, index: number) {
    const card = document.createElement("div");
    card.classList.add("status-card");

    const header = document.createElement("h1");
    header.classList.add("current-work-header");
    header.innerText = `Currently Compressing`;

    const innerCard = document.createElement("div")
    innerCard.classList.add("inner-card");

    const filename = document.createElement("h3");
    header.classList.add("current-work-filename");
    filename.innerText = `Filename: ${work.file.name}`

    const filepath = document.createElement("h3");
    filepath.classList.add("current-work-filename");
    filepath.innerText = `Path: ${work.file.path}`


    const spotinqueue = document.createElement("h3");
    spotinqueue.classList.add("current-work-size-before");

    const sayNext = (index == 1)? "next" : index;

    spotinqueue.innerHTML = `Queue Position: <strong class='size-tag'>${sayNext}</strong>`;


    // Add each inner node to parent
    innerCard.appendChild(filepath);
    innerCard.appendChild(spotinqueue);

    card.appendChild(innerCard);
    return card;
}


function currentlyBeingWorkedCard(work: WorkProperties) {
    const spinnerColor = randomSpinnerColor();
    const card = document.createElement("div");
    card.classList.add("status-card-current");

    const header = document.createElement("h1");
    header.classList.add("current-work-header");
    header.innerText = `Currently Compressing`;

    const innerCard = document.createElement("div")
    innerCard.classList.add("inner-card");

    const filename = document.createElement("h3");
    header.classList.add("current-work-filename");
    filename.innerText = `Filename: ${work.file.name}`

    const filepath = document.createElement("h3");
    filepath.classList.add("current-work-filename");
    filepath.innerText = `Path: ${work.file.path}`

    const out_filepath = document.createElement("h3");
    out_filepath.classList.add("current-work-filename");
    out_filepath.innerText = `Output: ${work.settings.new_path}\\${work.settings.ext}${work.file.name}`;

    const sizeBeforeCompression = document.createElement("h3");
    sizeBeforeCompression.classList.add("current-work-size-before");
    sizeBeforeCompression.innerHTML = `Size: <strong class='size-tag' style='color: ${spinnerColor};'>${work.file.size_mb}</strong>`;

    const outerBar = document.createElement("div");
    outerBar.id = "current-progress-outer";
    outerBar.classList.add("loader");

    outerBar.style.borderTopColor = spinnerColor;


    const innerBar = document.createElement("div");
    innerBar.id = "current-progress-inner";
     // innerBar.classList.add("current-progress-inner");
    innerBar.innerText = ``;

    outerBar.appendChild(innerBar);

    // Add each inner node to parent
    innerCard.appendChild(filename);
    innerCard.appendChild(filepath);
    innerCard.appendChild(out_filepath);
    innerCard.appendChild(sizeBeforeCompression);

    innerCard.appendChild(outerBar);

    card.appendChild(innerCard);
    return card;
}


function allDone () {
    const noti = new Notification("Compression is Done!", {body: "Finished compressing all the clips."});

    STATUS_DIV.innerHTML = "There is currently no work being done.";
}


function updateProgressBar (progress: number) {
    const parent = document.getElementById("current-progress-outer")
    const inner = document.getElementById("current-progress-inner")


    if (typeof progress == "number" && parent && inner) {
        const outerWidth = parent.clientWidth;
        const innerWidthNew = outerWidth * progress;


        inner.style.width = `${innerWidthNew}px`;
        inner.innerText = `${(progress * 100).toFixed(1)}%`

    } else {
        if (parent && inner) {
            parent.classList.remove("current-progress-outer");
            inner.classList.remove("current-progress-inner");

            parent.classList.add("loader");
        }
    }
}


function randomSpinnerColor () {
    let c = "";

    const colors = ['#f25c54', "#f27059", "#546cf2", "#545ff2", "#222", "#61f254"];

    c = colors[getRandomIntInclusive(0, colors.length - 1)];
    return c;
}

function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}


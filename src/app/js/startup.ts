async function startup () {
    console.log("show-ipc-logs: " + localStorage.getItem("show-ipc-logs") || false);
    app.app.OnIPCProgress("installing-dependecies", (data) => {
        updateStartupProgressInformation(data);

        if (localStorage.getItem("show-ipc-logs") === "true") console.log(data);
    });

    let ffmpegLocation = await app.app.ffmpegInstall();
    console.log("installed ffmpeg \n starting install of ffprobe");
    let ffprobeLocation = await app.app.ffprobegInstall();

    console.log("ffprobe and ffmpeg are installed.");
    LOADING.style.display = "none";
    DASHBOARD.style.display = "block";
}


function updateStartupProgressInformation (data: ProgressIPCData) {

    if (data.for !== "installing-dependecies" && data.for !== "download-ffmpeg" && data.for !== "download-ffprobe") return;

    LOADING_HINT_TEXT.innerText = data.msg;
    LOADING_BAR_INNER.style.width = `${(data.percentage * 100).toFixed(2)}%`;
}



startup();
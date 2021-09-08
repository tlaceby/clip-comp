
async function startup  () {
    let installedPath = await app.app.ffmpegInstall();
    console.log(installedPath);

    LOADING.style.display = "none";
    DASHBOARD.style.display = "block";

    toDashboard();
}


setTimeout(startup, 300)
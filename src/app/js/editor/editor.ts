let currentVideo: FileDetails;


async function selectEditVideo () {
    const openResult: FileDetails[] | undefined = await app.editor.selectVideoOpen();

    if (!openResult || openResult.length !== 1) return;
    currentVideo = openResult[0];

    showPostEditor();

}
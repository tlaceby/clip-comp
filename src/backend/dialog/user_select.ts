import { dialog, OpenDialogReturnValue } from "electron";


export async function user_select_multiple_files () {

    return new Promise<OpenDialogReturnValue>(async (res, rej) => {
        const diaolg_results = dialog.showOpenDialog({properties: ['multiSelections', 'openFile']});

        diaolg_results.then((results) => res(results));

        diaolg_results.catch((err) => rej(err));
    })

}


export async function user_select_destination () {

    return new Promise<OpenDialogReturnValue>(async (res, rej) => {
        const diaolg_results = dialog.showOpenDialog({properties: ["openDirectory"]});
        
        diaolg_results.then((results) => res(results));

        diaolg_results.catch((err) => rej(err));
    })

}

export async function user_select_single () {

    return new Promise<OpenDialogReturnValue>(async (res, rej) => {
        const diaolg_results = dialog.showOpenDialog({properties: ['openFile']});

        diaolg_results.then((results) => res(results));

        diaolg_results.catch((err) => rej(err));
    })

}

export function confirmUpdate (subject:string, extraInfo:string):boolean {
    const firstConfirm = window.confirm(`Really update the ${subject}?`);
    if(!firstConfirm) return false;

    const confirmPhrase = "UPDATE";
    if(extraInfo.length > 0){
        extraInfo= extraInfo+".";
    }
    const userInput = window.prompt(`${extraInfo} Type "${confirmPhrase}" to confirm ${subject} update.`);

    if (userInput !== confirmPhrase) {
        alert("Update cancelled.");
        return false;
    }
    return true;
}
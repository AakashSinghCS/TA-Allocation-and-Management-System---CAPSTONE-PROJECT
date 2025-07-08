export function confirmUpdate (subject:string, extraInfo:string):boolean {
    const firstConfirm = window.confirm(`Really update the ${subject}?`);
    if(!firstConfirm) return false;

    const confirmPhrase = "UPDATE";
    const userInput = window.prompt(`Type "${confirmPhrase}" to confirm ${subject} update. ${extraInfo}`);

    if (userInput !== confirmPhrase) {
        alert("Update cancelled.");
        return false;
    }
    return true;
}
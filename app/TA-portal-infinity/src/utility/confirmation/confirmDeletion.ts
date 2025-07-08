export function confirmDeletion (subject:string, extraInfo:string):boolean {
    const firstConfirm = window.confirm(`Really delete the ${subject}?`);
    if(!firstConfirm) return false;

    const confirmPhrase = "DELETE";
    const userInput = window.prompt(`Type "${confirmPhrase}" to confirm ${subject} deletion. ${extraInfo}`);

    if (userInput !== confirmPhrase) {
        alert("Deletion cancelled.");
        return false;
    }
    return true;
}
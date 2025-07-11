export function confirmDeletion (subject:string, extraInfo:string):boolean {
    const firstConfirm = window.confirm(`Really delete the ${subject}?`);
    if(!firstConfirm) return false;

    const confirmPhrase = "DELETE";
    if(extraInfo.length > 0){
        extraInfo= extraInfo+".";
    }
    const userInput = window.prompt(`${extraInfo} Type "${confirmPhrase}" to confirm ${subject} deletion. `);

    if (userInput !== confirmPhrase) {
        alert("Deletion cancelled.");
        return false;
    }
    return true;
}
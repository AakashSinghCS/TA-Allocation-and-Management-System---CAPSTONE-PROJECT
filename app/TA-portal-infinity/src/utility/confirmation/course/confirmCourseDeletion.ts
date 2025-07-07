export function confirmCourseDeletion ():boolean {
    const firstConfirm = window.confirm("Really delete the course?");
    if(!firstConfirm) return false;

    const confirmPhrase = "DELETE";
    const userInput = window.prompt(`Type "${confirmPhrase}" to confirm course deletion. This will delete all associated sections.`);

    if (userInput !== confirmPhrase) {
        alert("Deletion cancelled.");
        return false;
    }
    return true;
}
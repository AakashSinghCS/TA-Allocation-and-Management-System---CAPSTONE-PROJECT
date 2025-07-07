export function confirmUserDeletion(): boolean {
    const firstConfirm = window.confirm("Really delete the section?");
    if (!firstConfirm) return false;

    const confirmPhrase = "DELETE";
    const userInput = window.prompt(`Type "${confirmPhrase}" to confirm section deletion. This will delete associated schedule and exam data`);

    if (userInput !== confirmPhrase) {
        alert("Deletion cancelled.");
        return false;
    }
    return true;
}
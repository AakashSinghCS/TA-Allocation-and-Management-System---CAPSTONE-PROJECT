import UserBrowsingViewer from "./userbrowsingviewer/UserBrowsingViewer";

export default function UserBrowsingPage() {
    return (
        <div className="p-4">
            <h3 className="text-xl font-semibold mb-4">Search for User</h3>
            <UserBrowsingViewer />
        </div>
    );
}


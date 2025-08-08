import UserBrowsingViewer from "./userbrowsingviewer/UserBrowsingViewer";

export default function UserBrowsingPage() {
    return (
        <div className="p-4">
            <h1 className="text-2xl md:text-3xl font-bold text-[#040941] mb-4">Search for a User</h1>
            <UserBrowsingViewer />
        </div>
    );
}


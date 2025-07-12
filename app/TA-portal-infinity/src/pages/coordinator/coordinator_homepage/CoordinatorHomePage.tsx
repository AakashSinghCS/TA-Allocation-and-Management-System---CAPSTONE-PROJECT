
export default function CoordinatorHomePage() {
  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold text-[#040941] mb-4">Coordinator Dashboard</h1>
      <p className="text-gray-700 mb-2">
        Welcome to the TA Portal Infinity TA Coordinator View.
      </p>
      <p className="text-gray-600">
        You will be able to view TA applications, assign TAs to sections, and monitor progress here.
      </p>
      <a href="http://localhost:3000" target="_blank" rel="noopener">
        Open Grafana
      </a>
    </section>
  );
}

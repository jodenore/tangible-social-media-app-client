import "./AdminTabs.css";

const tabs = [
  { id: "players", label: "Players" },
  { id: "media", label: "Player media" },
];

function AdminTabs({ activeTab, onTabChange }) {
  return (
    <div className="admin-tabs" role="tablist" aria-label="Admin sections">
      {tabs.map((tab) => (
        <button
          aria-controls={`admin-${tab.id}-panel`}
          aria-selected={activeTab === tab.id}
          className={activeTab === tab.id ? "is-active" : ""}
          id={`admin-${tab.id}-tab`}
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          role="tab"
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default AdminTabs;

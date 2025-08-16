import { useTabStore } from "../state/tabStore";

export function TabBar() {
  const { tabs } = useTabStore();
  return (
    <div className="tabbar">
      {tabs.map((t) => (
        <div key={t.id} className="tab">{t.title || t.url}</div>
      ))}
    </div>
  );
}

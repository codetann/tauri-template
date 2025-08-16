type Props = { current: "webkit" | "chromium"; onChange: (e: "webkit" | "chromium") => void };
export function EngineSwitcher({ current, onChange }: Props) {
  return (
    <select value={current} onChange={(e) => onChange(e.target.value as any)}>
      <option value="webkit">WebKit (Tauri)</option>
      <option value="chromium">Chromium (stub)</option>
    </select>
  );
}

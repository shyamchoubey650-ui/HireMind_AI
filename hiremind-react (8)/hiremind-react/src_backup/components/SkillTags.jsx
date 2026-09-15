export default function SkillTags({ skills, cls = '' }) {
  if (!skills || skills.length === 0) {
    return <span className="muted" style={{ fontSize: 12 }}>None</span>;
  }
  return (
    <>
      {skills.map((s) => (
        <span key={s} className={`tag ${cls}`}>{s}</span>
      ))}
    </>
  );
}

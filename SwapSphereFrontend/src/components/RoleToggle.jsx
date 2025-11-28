import "../styles/RoleToggle.css";

export default function RoleToggle({ value, onChange }) {
  return (
    <div className="role-toggle">
      <button
        type="button"
        className={value === "user" ? "active" : ""}
        onClick={() => onChange("user")}
      >
        User
      </button>

      <button
        type="button"
        className={value === "admin" ? "active" : ""}
        onClick={() => onChange("admin")}
      >
        Admin
      </button>
    </div>
  );
}

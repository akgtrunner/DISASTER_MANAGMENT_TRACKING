export default function Toast({ title, msg }) {
  return (
    <div className="toast">
      <div className="toast-title">{title}</div>
      <div className="toast-msg">{msg}</div>
    </div>
  )
}

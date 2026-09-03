import { Link } from "react-router-dom";

export default function AccessDeniedPage() {
  return (
    <main className="access-denied-page">
      <div>
        <div className="access-denied-code">403</div>
        <h1>Access Denied</h1>
        <p>You do not have permission to access this section.</p>
        <Link to="/">Return Home</Link>
      </div>
    </main>
  );
}

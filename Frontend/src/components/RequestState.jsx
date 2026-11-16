export function LoadingState({ label = "Loading..." }) {
  return <p className="request-state" role="status">{label}</p>;
}

export function EmptyState({ children = "Nothing to show yet." }) {
  return <p className="request-state empty-projects">{children}</p>;
}

export function ErrorState({ message = "Something went wrong.", onRetry }) {
  return (
    <div className="request-state error-state" role="alert">
      <p>{message}</p>
      {onRetry ? <button className="btn btn-out mini" type="button" onClick={onRetry}>Try again</button> : null}
    </div>
  );
}

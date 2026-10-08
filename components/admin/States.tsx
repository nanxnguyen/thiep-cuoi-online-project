"use client";

export type EmptyStateProps = {
  title: string;
  hint?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, hint, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="adm-state" role="status">
      <div className="adm-state-mark" aria-hidden="true">○</div>
      <p className="adm-state-title">{title}</p>
      {hint ? <p className="adm-state-hint">{hint}</p> : null}
      {actionLabel && onAction ? (
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="adm-state adm-state-error" role="alert">
      <div className="adm-state-mark" aria-hidden="true">!</div>
      <p className="adm-state-title">Có lỗi xảy ra</p>
      <p className="adm-state-hint">{message}</p>
      {onRetry ? (
        <button type="button" className="adm-btn adm-btn-ghost" onClick={onRetry}>
          Thử lại
        </button>
      ) : null}
    </div>
  );
}

import { useEffect, useRef, type ReactNode } from "react";
import { X, ArrowUpRight, Inbox, Check, LoaderCircle } from "lucide-react";
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <a
      href="#/dashboard"
      className={"brand " + (light ? "brand-light" : "")}
      aria-label="RESTOCHAIN – Tổng quan"
    >
      <img src="/favicon.svg" alt="" />
      <span>
        resto<span className="brand-weight">chain</span>
        <small>F&B WORKSPACE</small>
      </span>
    </a>
  );
}
export function Button({
  children,
  onClick,
  kind = "",
  type = "button",
  disabled = false,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  kind?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={"btn " + kind + " " + className}
    >
      {children}
    </button>
  );
}
export function Badge({
  children,
  tone = "",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return <span className={"badge " + tone}>{children}</span>;
}
export function Empty({
  title = "Chưa có dữ liệu",
  text = "Thông tin sẽ xuất hiện khi bạn bắt đầu thao tác.",
  action,
}: {
  title?: string;
  text?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <Inbox size={30} />
      <strong>{title}</strong>
      <p>{text}</p>
      {action}
    </div>
  );
}
export function SectionHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => {
      ref.current?.close();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={"modal " + (wide ? "wide" : "")}
      aria-label={title}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button className="icon-btn" aria-label="Đóng" onClick={onClose}>
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Submit({
  busy,
  label = "Lưu thay đổi",
}: {
  busy: boolean;
  label?: string;
}) {
  return (
    <Button type="submit" kind="primary" disabled={busy}>
      {busy ? <LoaderCircle className="spin" size={17} /> : <Check size={17} />}{" "}
      {busy ? "Đang lưu…" : label}
    </Button>
  );
}
export function Stat({
  label,
  value,
  note,
  icon,
  tone = "",
  change,
}: {
  label: string;
  value: string;
  note: string;
  icon: ReactNode;
  tone?: string;
  change?: string;
}) {
  return (
    <article className={"stat " + tone}>
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-bottom">
        {change && (
          <span>
            <ArrowUpRight size={14} />
            {change}
          </span>
        )}
        <small>{note}</small>
      </div>
    </article>
  );
}

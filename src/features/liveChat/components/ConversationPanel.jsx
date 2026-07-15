import { useEffect, useRef, useState } from "react";
import { navigate } from "../../../router/navigation";
import { avatarColor, initials, statusConfigFor } from "../conversationDisplay";
import { ChatIcon } from "../../../layouts/navIcons";
import {
  AlertIcon,
  ClockIcon,
  DocumentIcon,
  DoubleCheckIcon,
  MoreIcon,
  PaperclipIcon,
  SendIcon,
  ShuffleIcon,
  SingleCheckIcon,
  TicketIcon,
} from "./chatIcons";

const TYPING_STOP_DELAY_MS = 1200;

const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_ATTACHMENT_MB = 10;

function formatTime(dateInput) {
  if (!dateInput) return "";

  return new Date(dateInput).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fileNameFromUrl(url) {
  try {
    const last = decodeURIComponent(url.split("/").pop());
    const underscoreIndex = last.indexOf("_");
    return underscoreIndex > -1 ? last.slice(underscoreIndex + 1) : last;
  } catch {
    return "ملف";
  }
}

function MessageBubble({ message, currentUserId, onRetry }) {
  const isAgent = message.sender_type === "agent";
  const isImage = message.message_type === "image";
  const isFile = message.message_type === "file";
  const isSystem = message.sender_type === "system";
  const isSending = message.status === "sending";
  const isFailed = message.status === "failed";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <p className="m-0 max-w-[85%] rounded-full border border-dashed border-brand-gray/25 bg-brand-gray/5 px-4 py-2 text-center text-xs font-semibold leading-5 text-brand-gray/70">
          {message.message}
        </p>
      </div>
    );
  }

  return (
    <div className={`group flex items-end gap-1.5 ${isAgent ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-lg text-sm font-semibold leading-6 ${
          isImage ? "overflow-hidden p-1.5" : "px-4 py-3"
        } ${isAgent ? "bg-brand-accent/10 text-brand-navy" : "border border-brand-gray/15 bg-white text-brand-navy"} ${
          isSending ? "opacity-60" : ""
        } ${isFailed ? "border border-red-200 bg-red-50" : ""}`}
      >
        {isImage ? (
          <a href={message.message} target="_blank" rel="noreferrer">
            <img
              src={message.message}
              alt="مرفق"
              className="max-h-64 w-full rounded-md object-cover"
            />
          </a>
        ) : isFile ? (
          <a
            href={message.message}
            target="_blank"
            rel="noreferrer"
            className="m-0 flex items-center gap-1.5 whitespace-pre-wrap underline"
          >
            <DocumentIcon className="h-4 w-4 shrink-0" />
            <span className="break-all">{fileNameFromUrl(message.message)}</span>
          </a>
        ) : (
          <p className="m-0 whitespace-pre-wrap">{message.message}</p>
        )}
        <span
          className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-bold text-brand-gray/60 ${
            isAgent ? "justify-end" : "justify-start"
          } ${isImage ? "px-2 pb-1" : ""}`}
        >
          {isFailed ? (
            <button
              type="button"
              onClick={() => onRetry?.(message)}
              className="flex items-center gap-1 font-bold text-red-600 hover:underline"
            >
              <AlertIcon className="size-3.5" />
              فشل الإرسال - إعادة المحاولة
            </button>
          ) : (
            <>
              <span>{formatTime(message.created_at)}</span>
              {isSending ? (
                <ClockIcon className="h-3.5 w-3.5 text-brand-gray/40" />
              ) : isAgent ? (
                <span className={message.is_read ? "text-brand-primary" : ""}>
                  {message.is_read ? (
                    <DoubleCheckIcon className="h-3.5 w-3.5" />
                  ) : (
                    <SingleCheckIcon className="h-3.5 w-3.5" />
                  )}
                </span>
              ) : null}
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export function ConversationPanel({
  conversation,
  messages,
  isLoading,
  currentUserId,
  onSendMessage,
  onRetryMessage,
  onSendAttachment,
  onTypingChange,
  isSending,
  isCustomerTyping,
  isSupervisor,
  departmentAgents = [],
  departments = [],
  onAssign,
  onTransfer,
  onClose,
  onReopen,
  onAutoAssign,
  onConvertToTicket,
  actionStatus,
  actionError,
  actionSuccess,
}) {
  const [draft, setDraft] = useState("");
  const [isMenuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, isCustomerTyping]);

  useEffect(() => {
    setMenuOpen(false);
  }, [conversation?.id]);

  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutRef.current);
      if (isTypingRef.current) {
        onTypingChange?.(false);
      }
    };
  }, [onTypingChange]);

  function stopTypingSoon() {
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTypingChange?.(false);
    }, TYPING_STOP_DELAY_MS);
  }

  function handleDraftChange(event) {
    const value = event.target.value;
    setDraft(value);

    if (!conversation || isSending) return;

    const hasText = Boolean(value.trim());
    if (hasText && !isTypingRef.current) {
      isTypingRef.current = true;
      onTypingChange?.(true);
    }

    if (hasText) {
      stopTypingSoon();
    } else if (isTypingRef.current) {
      clearTimeout(typingTimeoutRef.current);
      isTypingRef.current = false;
      onTypingChange?.(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const trimmed = draft.trim();
    if (!trimmed || isSending) return;

    onSendMessage(trimmed);
    setDraft("");
    clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    onTypingChange?.(false);
  }

  function handleAttachmentChange(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || isSending) return;

    const isImage = file.type.startsWith("image/");
    const isAllowedDocument = ALLOWED_ATTACHMENT_TYPES.includes(file.type);

    if (!isImage && !isAllowedDocument) {
      window.alert("يُسمح فقط بإرفاق صور أو ملفات PDF أو Word.");
      return;
    }

    if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      window.alert(`حجم الملف أكبر من ${MAX_ATTACHMENT_MB} ميجابايت.`);
      return;
    }

    onSendAttachment(file);
  }

  if (!conversation) {
    return (
      <div className="grid h-full min-h-0 place-items-center rounded-lg border border-brand-gray/15 bg-white shadow-[0_14px_35px_rgba(17,45,95,0.05)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-brand-gray/8 text-brand-gray/40">
            <ChatIcon className="size-7" />
          </div>
          <p className="m-0 text-sm font-bold text-brand-gray/60">
            اختر محادثة لعرضها
          </p>
        </div>
      </div>
    );
  }

  const isClosed = conversation.status === "closed";
  const isActionBusy = actionStatus === "loading";

  function handleAssignChange(event) {
    const value = event.target.value;
    if (!value) return;

    onAssign?.(Number(value));
  }

  function handleTransferChange(event) {
    const value = event.target.value;
    if (!value) return;

    onTransfer?.(Number(value));
    event.target.value = "";
  }

  const status = statusConfigFor(conversation.status);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-brand-gray/15 bg-white shadow-[0_14px_35px_rgba(17,45,95,0.05)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-gray/12 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`grid size-10 shrink-0 place-items-center rounded-full text-xs font-black ${avatarColor(conversation.visitor_name)}`}>
            {initials(conversation.visitor_name)}
          </div>

          <div>
            {conversation.customer_id ? (
              <button
                type="button"
                onClick={() => navigate(`/customers/${conversation.customer_id}`)}
                className="m-0 text-sm font-black text-brand-navy hover:text-brand-primary hover:underline"
              >
                {conversation.visitor_name}
              </button>
            ) : (
              <p className="m-0 text-sm font-black text-brand-navy">
                {conversation.visitor_name}
              </p>
            )}
            <div className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-brand-gray/60">
              <span className="inline-flex items-center gap-1">
                <span className={`size-1.5 rounded-full ${status.color}`} />
                {status.label}
              </span>
              <span className="text-brand-gray/30">·</span>
              <span>
                {conversation.department?.name || ''}
                {conversation.department?.name ? ' · ' : ''}
                {conversation.assigned_agent ? `معينة إلى ${conversation.assigned_agent.name}` : 'غير معينة لأحد'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isClosed && departments.length > 0 ? (
            <select
              onChange={handleTransferChange}
              disabled={isActionBusy}
              defaultValue=""
              aria-label="نقل إلى قسم"
              className="rounded-lg border border-brand-gray/15 bg-white px-2.5 py-2 text-xs font-bold text-brand-navy focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15 disabled:opacity-50"
            >
              <option value="" disabled>
                نقل إلى قسم...
              </option>
              {departments
                .filter((dept) => dept.id !== (conversation.department_id ?? conversation.department?.id))
                .map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
            </select>
          ) : null}

          {isSupervisor && !isClosed ? (
            <select
              value={conversation.assigned_agent?.id || ""}
              onChange={handleAssignChange}
              disabled={isActionBusy}
              aria-label="تعيين لموظف"
              className="rounded-lg border border-brand-gray/15 bg-white px-2.5 py-2 text-xs font-bold text-brand-navy focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15 disabled:opacity-50"
            >
              <option value="">
                {conversation.assigned_agent
                  ? "إعادة التعيين إلى..."
                  : "تعيين لموظف..."}
              </option>
              {departmentAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.is_online ? "🟢" : "⚪"} {agent.name}
                </option>
              ))}
            </select>
          ) : null}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="grid size-9 shrink-0 place-items-center rounded-lg border border-brand-gray/15 text-brand-gray transition hover:bg-brand-gray/6"
              aria-label="خيارات المحادثة"
              aria-expanded={isMenuOpen}
            >
              <MoreIcon className="size-4" />
            </button>

            {isMenuOpen ? (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute left-0 top-full z-20 mt-1.5 w-48 rounded-lg border border-brand-gray/15 bg-white py-1.5 shadow-[0_10px_30px_rgba(17,45,95,0.12)]">
                  {!conversation.assigned_agent && !isClosed ? (
                    <button
                      type="button"
                      disabled={isActionBusy}
                      onClick={() => {
                        setMenuOpen(false);
                        onAutoAssign?.();
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-right text-xs font-bold text-brand-navy transition hover:bg-brand-gray/6 disabled:opacity-50"
                    >
                      <ShuffleIcon className="size-4 text-brand-gray/60" />
                      توزيع تلقائي
                    </button>
                  ) : null}

                  <button
                    type="button"
                    disabled={isActionBusy}
                    onClick={() => {
                      setMenuOpen(false);
                      onConvertToTicket?.();
                    }}
                    className="flex w-full items-center gap-2 px-3.5 py-2 text-right text-xs font-bold text-brand-navy transition hover:bg-brand-gray/6 disabled:opacity-50"
                  >
                    <TicketIcon className="size-4 text-brand-gray/60" />
                    تحويل إلى تذكرة
                  </button>

                  <div className="my-1 border-t border-brand-gray/10" />

                  {isClosed ? (
                    <button
                      type="button"
                      disabled={isActionBusy}
                      onClick={() => {
                        setMenuOpen(false);
                        onReopen?.();
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-right text-xs font-bold text-brand-primary transition hover:bg-brand-gray/6 disabled:opacity-50"
                    >
                      إعادة فتح المحادثة
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isActionBusy}
                      onClick={() => {
                        setMenuOpen(false);
                        onClose?.();
                      }}
                      className="flex w-full items-center gap-2 px-3.5 py-2 text-right text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      إغلاق المحادثة
                    </button>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {actionError ? (
        <p className="m-0 border-b border-red-100 bg-red-50 px-5 py-2 text-xs font-bold text-red-700">
          {actionError}
        </p>
      ) : null}

      {actionSuccess ? (
        <div className="flex items-center gap-2 border-b border-green-100 bg-green-50 px-5 py-2.5">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-green-500 text-white">
            <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </span>
          <span className="text-xs font-bold text-green-700">{actionSuccess}</span>
        </div>
      ) : null}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4"
      >
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[true, false, true, true, false].map((isAgent, index) => (
              <div key={index} className={`flex ${isAgent ? "justify-end" : "justify-start"}`}>
                <div className={`h-14 w-2/5 rounded-lg ${isAgent ? "bg-brand-accent/10" : "bg-brand-gray/8"}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="grid size-12 place-items-center rounded-full bg-brand-gray/8 text-brand-gray/40">
              <ChatIcon className="size-6" />
            </div>
            <p className="m-0 text-sm font-bold text-brand-gray/60">
              لا توجد رسائل بعد
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUserId}
              onRetry={onRetryMessage}
            />
          ))
        )}

        {isCustomerTyping ? (
          <div className="flex justify-start">
            <div className="rounded-lg border border-brand-gray/15 bg-white px-4 py-3">
              <span className="flex items-center gap-1">
                <span className="size-1.5 animate-bounce rounded-full bg-brand-gray/60 [animation-delay:-0.3s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-brand-gray/60 [animation-delay:-0.15s]" />
                <span className="size-1.5 animate-bounce rounded-full bg-brand-gray/60" />
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {isClosed ? (
        <div className="flex items-center justify-between gap-3 border-t border-brand-gray/12 px-5 py-4">
          <p className="m-0 text-sm font-bold text-brand-gray/60">
            تم إغلاق هذه المحادثة.
          </p>
          <button
            type="button"
            onClick={onReopen}
            disabled={isActionBusy}
            className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-brand-navy disabled:opacity-50"
          >
            إعادة فتح المحادثة
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 border-t border-brand-gray/12 px-5 py-4"
        >
          <div className="flex flex-1 items-center gap-3 rounded-lg bg-brand-gray/8 px-4 py-3 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-primary/15">
            <input
              type="text"
              value={draft}
              onChange={handleDraftChange}
              placeholder="اكتب رسالتك هنا...."
              disabled={isSending}
              className="flex-1 bg-transparent text-sm font-semibold text-brand-navy placeholder:text-brand-gray/60 focus:outline-none"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={handleAttachmentChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending}
              className="text-brand-gray/60 transition hover:text-brand-gray disabled:opacity-50"
              aria-label="إرفاق ملف"
              tabIndex={-1}
            >
              <PaperclipIcon className="size-5" />
            </button>
          </div>
          <button
            type="submit"
            disabled={isSending || !draft.trim()}
            className="grid size-12 shrink-0 place-items-center rounded-lg bg-brand-primary text-white transition hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="إرسال"
          >
            <SendIcon className="size-5 rtl:-scale-x-100" />
          </button>
        </form>
      )}
    </div>
  );
}

import { timeAgoAr } from '../../../lib/formatRelativeAr'
import { ChatIcon } from '../../../layouts/navIcons'
import { PRIORITY_BADGE, PRIORITY_LABELS } from '../../customers/customerLabels'
import { avatarColor, initials, statusConfigFor } from '../conversationDisplay'

// 'waiting' is the unassigned queue - agents are scoped to their own
// assigned conversations only (see ConversationService::isOutOfScope on
// the backend) and never have anything in that tab, so it's hidden for
// them rather than shown permanently empty.
const TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'waiting', label: 'قيد الإنتظار', supervisorOnly: true },
  { key: 'active', label: 'النشط' },
  { key: 'closed', label: 'مغلقة' },
]

function ConversationListItem({ conversation, isSelected, onSelect }) {
  const status = statusConfigFor(conversation.status)
  const hasUnread = conversation.unread_count > 0

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isSelected ? 'true' : undefined}
      className={`relative w-full border-b border-brand-gray/10 py-3.5 pr-4 pl-5 text-right transition last:border-b-0 ${
        isSelected ? 'bg-brand-primary/6' : 'hover:bg-brand-gray/5'
      }`}
    >
      {isSelected ? <span className="absolute inset-y-0 right-0 w-0.5 bg-brand-primary" /> : null}

      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className={`grid size-10 place-items-center rounded-full text-xs font-black ${avatarColor(conversation.visitor_name)}`}>
            {initials(conversation.visitor_name)}
          </div>
          <span className={`absolute -bottom-0.5 -left-0.5 size-2.5 rounded-full ring-2 ring-white ${status.color}`} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={`m-0 truncate text-sm ${hasUnread ? 'font-black text-brand-navy' : 'font-bold text-brand-navy/90'}`}>
              {conversation.visitor_name}
            </p>
            <span className="shrink-0 text-[11px] font-semibold text-brand-gray/45">
              {timeAgoAr(conversation.updated_at || conversation.started_at)}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between gap-2">
            <span className={`truncate text-xs ${hasUnread ? 'font-bold text-brand-navy/70' : 'font-semibold text-brand-gray/60'}`}>
              {conversation.last_message || 'لا توجد رسائل بعد'}
            </span>
            {hasUnread ? (
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand-primary text-[10px] font-black text-white">
                {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
              </span>
            ) : null}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-gray/8 px-2 py-0.5 text-[10px] font-bold text-brand-gray/70">
              <span className={`size-1.5 rounded-full ${status.color}`} />
              {status.label}
            </span>
            {conversation.priority === 'high' || conversation.priority === 'urgent' ? (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_BADGE[conversation.priority]}`}>
                {PRIORITY_LABELS[conversation.priority]}
              </span>
            ) : null}
            {conversation.assigned_agent?.name ? (
              <span className="truncate rounded-full bg-brand-gray/8 px-2 py-0.5 text-[10px] font-bold text-brand-gray/70">
                {conversation.assigned_agent.name}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </button>
  )
}

function ConversationListSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-brand-gray/10">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 px-4 py-3.5">
          <div className="size-10 shrink-0 rounded-full bg-brand-gray/10" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="h-3 w-24 rounded-full bg-brand-gray/10" />
              <div className="h-2.5 w-10 rounded-full bg-brand-gray/10" />
            </div>
            <div className="h-2.5 w-4/5 rounded-full bg-brand-gray/8" />
            <div className="h-2.5 w-16 rounded-full bg-brand-gray/8" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ tab }) {
  const message = tab === 'all' ? 'لا توجد محادثات بعد' : 'لا توجد محادثات في هذا القسم'

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-brand-gray/8 text-brand-gray/40">
        <ChatIcon className="size-6" />
      </div>
      <p className="m-0 text-sm font-bold text-brand-gray/60">{message}</p>
    </div>
  )
}

function TabBadge({ count, isActive }) {
  if (!count) return null

  return (
    <span
      className={`inline-flex min-w-4.5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none ${
        isActive ? 'bg-brand-primary text-white' : 'bg-brand-gray/15 text-brand-gray/70'
      }`}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function ConversationList({
  conversations,
  isLoading,
  selectedId,
  onSelect,
  tab,
  onTabChange,
  tabUnreadCounts,
  hasMore,
  onLoadMore,
  isSupervisor,
}) {
  const visibleTabs = TABS.filter((item) => !item.supervisorOnly || isSupervisor)

  return (
    <div className="flex h-full min-h-0 flex-col rounded-lg border border-brand-gray/15 bg-white shadow-[0_14px_35px_rgba(17,45,95,0.05)]">
      <div className="flex items-center justify-between gap-2 px-4 pt-4">
        <h2 className="m-0 text-base font-black text-brand-navy">قائمة المحادثات</h2>
        {!isLoading && conversations.length > 0 ? (
          <span className="rounded-full bg-brand-gray/8 px-2 py-0.5 text-[11px] font-bold text-brand-gray/60">
            {conversations.length}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-4 border-b border-brand-gray/12 px-4">
        {visibleTabs.map((item) => {
          const isActive = tab === item.key

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 pb-2.5 text-sm font-bold transition ${
                isActive ? 'border-brand-primary text-brand-primary' : 'border-transparent text-brand-gray/60 hover:text-brand-gray'
              }`}
            >
              {item.label}
              <TabBadge count={tabUnreadCounts?.[item.key]} isActive={isActive} />
            </button>
          )
        })}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <ConversationListSkeleton />
        ) : conversations.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <>
            {conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isSelected={conversation.id === selectedId}
                onSelect={() => onSelect(conversation.id)}
              />
            ))}
            {hasMore ? (
              <button
                type="button"
                onClick={onLoadMore}
                className="w-full border-t border-brand-gray/12 py-3 text-xs font-bold text-brand-primary transition hover:bg-brand-gray/6"
              >
                تحميل المزيد
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

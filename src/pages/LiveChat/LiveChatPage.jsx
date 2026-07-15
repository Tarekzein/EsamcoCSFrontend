import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { ConversationList } from '../../features/liveChat/components/ConversationList'
import { ConversationPanel } from '../../features/liveChat/components/ConversationPanel'
import { SearchIcon } from '../../features/liveChat/components/chatIcons'
import {
  actionSuccessCleared,
  assignConversationToAgent,
  autoAssignSelectedConversation,
  closeSelectedConversation,
  conversationSelected,
  convertSelectedConversationToTicket,
  loadConversations,
  loadMessages,
  markConversationMessagesAsRead,
  messageQueued,
  messageRetrying,
  messagesRead,
  reopenSelectedConversation,
  sendChatAttachment,
  sendChatMessage,
  sendTypingSignal,
  transferConversationToDepartment,
  typingReceived,
} from '../../features/liveChat/liveChatSlice'
import { loadUsers } from '../../features/users/usersSlice'
import { loadDepartments } from '../../features/departments/departmentsSlice'
import { ChatIcon } from '../../layouts/navIcons'
import { connectEcho, onConnectionStateChange } from '../../lib/echo'

const CONNECTION_LABELS = {
  connected: { label: 'متصل', dot: 'bg-green-500' },
  connecting: { label: 'جارٍ الاتصال...', dot: 'bg-amber-400' },
  unavailable: { label: 'غير متصل', dot: 'bg-red-500' },
  failed: { label: 'غير متصل', dot: 'bg-red-500' },
  disconnected: { label: 'غير متصل', dot: 'bg-red-500' },
}

// If a `typing: false` event is ever dropped, don't leave the indicator
// stuck on forever.
const TYPING_TIMEOUT_MS = 6000

function matchesSearch(conversation, search) {
  if (!search.trim()) return true

  const term = search.trim().toLowerCase()

  return (
    conversation.visitor_name?.toLowerCase().includes(term) || conversation.visitor_phone?.toLowerCase().includes(term)
  )
}

// The backend now only ever sends an agent their own assigned
// conversations plus the department's still-unassigned/pending queue -
// never a colleague's conversation - so "waiting" can keep its literal
// meaning for every role.
function matchesTab(conversation, tab) {
  if (tab === 'all') return true
  if (tab === 'closed') return conversation.status === 'closed'
  if (tab === 'waiting') return conversation.status === 'waiting'
  if (tab === 'active') return conversation.status === 'assigned' || conversation.status === 'active'

  return true
}

export function LiveChatPage({ conversationIdFromUrl }) {
  const dispatch = useAppDispatch()

  const currentUser = useAppSelector((state) => state.auth.user)
  const departmentId = currentUser?.department_id
  const userRole = currentUser?.role
  const userId = currentUser?.id
  const conversations = useAppSelector((state) => state.liveChat.conversations)
  const conversationsStatus = useAppSelector((state) => state.liveChat.conversationsStatus)
  const conversationsMeta = useAppSelector((state) => state.liveChat.conversationsMeta)
  const selectedId = useAppSelector((state) => state.liveChat.selectedId)
  const messagesByConversation = useAppSelector((state) => state.liveChat.messagesByConversation)
  const messagesStatus = useAppSelector((state) => state.liveChat.messagesStatus)
  const isSending = useAppSelector((state) => state.liveChat.isSending)
  const conversationActionStatus = useAppSelector((state) => state.liveChat.conversationActionStatus)
  const conversationActionError = useAppSelector((state) => state.liveChat.conversationActionError)
  const conversationActionSuccess = useAppSelector((state) => state.liveChat.conversationActionSuccess)
  const error = useAppSelector((state) => state.liveChat.error)
  const isCustomerTyping = useAppSelector((state) =>
    selectedId ? Boolean(state.liveChat.typingByConversation[selectedId]) : false
  )
  const departmentUsers = useAppSelector((state) => state.users.items)
  const departments = useAppSelector((state) => state.departments.items)

  const isSupervisor = userRole === 'supervisor'

  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [connectionState, setConnectionState] = useState('connecting')
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    dispatch(loadConversations({ page: 1 }))
  }, [dispatch])

  useEffect(() => {
    const unsubscribe = onConnectionStateChange(setConnectionState)
    return unsubscribe
  }, [])

  const handleLoadMoreConversations = useCallback(() => {
    if (!conversationsMeta || conversationsMeta.current_page >= conversationsMeta.last_page) return

    dispatch(loadConversations({ page: conversationsMeta.current_page + 1 }))
  }, [dispatch, conversationsMeta])

  useEffect(() => {
    if (conversationIdFromUrl && conversationsStatus === 'succeeded' && !selectedId) {
      dispatch(conversationSelected(conversationIdFromUrl))
    }
  }, [conversationIdFromUrl, conversationsStatus, selectedId, dispatch])

  // Only supervisors get the manual-assign dropdown, so only they need
  // the department's agent roster.
  useEffect(() => {
    if (isSupervisor) dispatch(loadUsers())
  }, [dispatch, isSupervisor])

  // Both agents and supervisors need the departments list for the
  // transfer-to-department dropdown.
  useEffect(() => {
    dispatch(loadDepartments())
  }, [dispatch])

  // Auto-dismiss the success toast after 4 seconds.
  useEffect(() => {
    if (!conversationActionSuccess) return
    const timer = setTimeout(() => dispatch(actionSuccessCleared()), 4000)
    return () => clearTimeout(timer)
  }, [conversationActionSuccess, dispatch])

  const departmentAgents = useMemo(
    () => (isSupervisor ? departmentUsers.filter((user) => user.role === 'agent') : []),
    [isSupervisor, departmentUsers]
  )

  useEffect(() => {
    if (selectedId) dispatch(loadMessages(selectedId))
  }, [dispatch, selectedId])

  // Only leave/rejoin this one when the selected conversation changes.
  useEffect(() => {
    if (!selectedId) return

    const echo = connectEcho()
    const channelName = `live-chat.conversation.${selectedId}`

    echo
      .private(channelName)
      .listen('.messages.read', (payload) => {
        dispatch(messagesRead({
          conversationId: payload.conversation_id || selectedId,
          messageIds: payload.message_ids || [],
        }))
      })
      .listen('.typing', (payload) => {
        dispatch(typingReceived({
          conversationId: payload.conversation_id || selectedId,
          senderType: payload.sender_type,
          typing: payload.typing,
        }))

        clearTimeout(typingTimeoutRef.current)
        if (payload.typing) {
          typingTimeoutRef.current = setTimeout(() => {
            dispatch(typingReceived({
              conversationId: payload.conversation_id || selectedId,
              senderType: payload.sender_type,
              typing: false,
            }))
          }, TYPING_TIMEOUT_MS)
        }
      })

    return () => {
      clearTimeout(typingTimeoutRef.current)
      echo.leave(channelName)
    }
  }, [dispatch, selectedId])

  const messages = useMemo(
    () => (selectedId && messagesByConversation[selectedId]) || [],
    [messagesByConversation, selectedId]
  )
  const messagesLoading = selectedId != null && messagesStatus[selectedId] === 'loading'

  useEffect(() => {
    if (!selectedId || messages.length === 0) return

    const unreadVisitorMessageIds = messages
      .filter((message) => message.sender_type === 'visitor' && !message.is_read)
      .map((message) => message.id)

    if (unreadVisitorMessageIds.length > 0) {
      dispatch(markConversationMessagesAsRead({ conversationId: selectedId, messageIds: unreadVisitorMessageIds }))
    }
  }, [dispatch, selectedId, messages])

  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        (conversation) =>
          conversation.department_id === departmentId &&
          matchesSearch(conversation, search) &&
          matchesTab(conversation, tab)
      ),
    [conversations, search, tab, departmentId]
  )

  // Per-tab badge: how many conversations in that tab have an unread
  // message waiting, so a supervisor/agent can tell at a glance which
  // queue needs attention without opening each one. Scoped by department
  // the same way filteredConversations is, so the badges never show a
  // count that doesn't match what's actually visible in the list.
  const tabUnreadCounts = useMemo(() => {
    const counts = {}
    const ownDepartmentConversations = conversations.filter((conversation) => conversation.department_id === departmentId)

    for (const key of ['all', 'waiting', 'active', 'closed']) {
      counts[key] = ownDepartmentConversations.filter(
        (conversation) => matchesTab(conversation, key) && (conversation.unread_count ?? 0) > 0
      ).length
    }

    return counts
  }, [conversations, departmentId])

  const selectedConversation = conversations.find((conversation) => conversation.id === selectedId) || null

  const handleSendMessage = useCallback((text) => {
    if (!selectedId) return

    // Shown immediately as "sending" rather than only appearing once the
    // server confirms - reconciled (or marked "failed", with a retry
    // affordance) once sendChatMessage settles.
    const clientId = `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`
    dispatch(messageQueued({ conversationId: selectedId, clientId, text }))
    dispatch(sendChatMessage({ conversationId: selectedId, message: text, clientId }))
  }, [dispatch, selectedId])

  const handleSendAttachment = useCallback((file) => {
    if (!selectedId) return

    dispatch(sendChatAttachment({ conversationId: selectedId, file }))
  }, [dispatch, selectedId])

  const handleTypingChange = useCallback((typing) => {
    if (!selectedId) return

    dispatch(sendTypingSignal({ conversationId: selectedId, typing }))
  }, [dispatch, selectedId])

  const handleAssign = useCallback((agentId) => {
    if (!selectedId) return

    dispatch(assignConversationToAgent({ conversationId: selectedId, agentId }))
  }, [dispatch, selectedId])

  const handleCloseConversation = useCallback(() => {
    if (!selectedId) return

    dispatch(closeSelectedConversation(selectedId))
  }, [dispatch, selectedId])

  const handleReopenConversation = useCallback(() => {
    if (!selectedId) return

    dispatch(reopenSelectedConversation(selectedId))
  }, [dispatch, selectedId])

  const handleTransfer = useCallback((departmentId) => {
    if (!selectedId) return

    dispatch(transferConversationToDepartment({ conversationId: selectedId, departmentId }))
  }, [dispatch, selectedId])

  const handleRetryMessage = useCallback((message) => {
    if (!selectedId) return

    dispatch(messageRetrying({ conversationId: selectedId, clientId: message.clientId }))
    dispatch(sendChatMessage({ conversationId: selectedId, message: message.message, clientId: message.clientId }))
  }, [dispatch, selectedId])

  const handleAutoAssign = useCallback(() => {
    if (!selectedId) return

    dispatch(autoAssignSelectedConversation(selectedId))
  }, [dispatch, selectedId])

  const handleConvertToTicket = useCallback(() => {
    if (!selectedId) return
    if (!window.confirm('هل تريد تحويل هذه المحادثة إلى تذكرة؟')) return

    dispatch(convertSelectedConversationToTicket(selectedId))
  }, [dispatch, selectedId])

  return (
    <div dir="rtl" className="flex h-[calc(100vh-220px)] min-h-130 flex-col gap-4">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-brand-gray/15 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(17,45,95,0.06)] max-sm:flex-col max-sm:items-stretch">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-lg font-black text-brand-navy">
            <span>الدردشة المباشرة</span>
            <ChatIcon className="size-6 text-brand-primary" />
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-brand-gray/6 px-2.5 py-1 text-[11px] font-bold text-brand-gray/70">
            <span className={`size-1.5 rounded-full ${CONNECTION_LABELS[connectionState]?.dot || 'bg-brand-gray/40'}`} />
            {CONNECTION_LABELS[connectionState]?.label || connectionState}
          </span>
        </div>

        <div className="relative w-full max-w-md">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-brand-gray/60" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="بحث..."
            className="w-full rounded-lg border border-brand-gray/15 bg-white py-3 pr-4 pl-11 text-sm font-semibold text-brand-navy placeholder:text-brand-gray/60 focus:border-brand-primary/40 focus:outline-none focus:ring-2 focus:ring-brand-primary/15"
          />
        </div>
      </div>

      {error ? (
        <p className="m-0 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-bold text-red-700">{error}</p>
      ) : null}

      <div dir="ltr" className="grid min-h-0 flex-1 grid-cols-[340px_1fr] gap-4 max-lg:grid-cols-1">
        <div dir="rtl" className="min-h-0 max-lg:h-80">
          <ConversationList
            conversations={filteredConversations}
            isLoading={conversationsStatus === 'loading'}
            selectedId={selectedId}
            onSelect={(id) => {
              dispatch(conversationSelected(id))
              window.history.replaceState({}, '', `/live-chat/${id}`)
            }}
            tab={tab}
            onTabChange={setTab}
            tabUnreadCounts={tabUnreadCounts}
            hasMore={Boolean(conversationsMeta && conversationsMeta.current_page < conversationsMeta.last_page)}
            onLoadMore={handleLoadMoreConversations}
            isSupervisor={isSupervisor}
          />
        </div>

        <div dir="rtl" className="min-h-0">
          <ConversationPanel
            conversation={selectedConversation}
            messages={messages}
            isLoading={messagesLoading}
            currentUserId={userId}
            onSendMessage={handleSendMessage}
            onRetryMessage={handleRetryMessage}
            onAutoAssign={handleAutoAssign}
            onConvertToTicket={handleConvertToTicket}
            onSendAttachment={handleSendAttachment}
            onTypingChange={handleTypingChange}
            isSending={isSending}
            isCustomerTyping={isCustomerTyping}
            isSupervisor={isSupervisor}
            departmentAgents={departmentAgents}
            departments={departments}
            onAssign={handleAssign}
            onTransfer={handleTransfer}
            onClose={handleCloseConversation}
            onReopen={handleReopenConversation}
            actionStatus={conversationActionStatus}
            actionError={conversationActionError}
            actionSuccess={conversationActionSuccess}
          />
        </div>
      </div>
    </div>
  )
}

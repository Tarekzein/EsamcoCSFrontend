import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { connectEcho, disconnectEcho } from '../../lib/echo'
import { playNotificationSound } from '../../lib/notificationSound'
import { conversationReceived, loadConversations, messageReceived } from './liveChatSlice'

// Joins the department-wide Reverb channel for the whole logged-in session
// (not just while the Live Chat page is mounted), so the conversation list
// and the notification sound both stay live no matter which dashboard page
// the agent is on. Call this once from a component that stays mounted for
// the entire session (DashboardLayout) - joining it twice (e.g. also from
// LiveChatPage) would double-fire every event, since echo.js's connection
// is an unreferenced-counted singleton and pusher-js calls every
// `.listen()` registered on a channel.
export function useLiveChatDepartmentChannel(currentPath) {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const selectedId = useAppSelector((state) => state.liveChat.selectedId)
  const conversations = useAppSelector((state) => state.liveChat.conversations)

  const userRole = user?.role
  const departmentId = user?.department_id
  const userId = user?.id

  // Read inside the socket callback via a ref rather than as effect deps,
  // so switching pages/conversations doesn't tear down and rejoin the
  // channel - only used to decide whether to play the notification sound,
  // and (for agents) whether a message's conversation is even one they're
  // scoped to see.
  const contextRef = useRef({ currentPath, selectedId, conversations })
  useEffect(() => {
    contextRef.current = { currentPath, selectedId, conversations }
  }, [currentPath, selectedId, conversations])

  useEffect(() => {
    if (!(userRole === 'supervisor' || userRole === 'agent') || !departmentId) return

    // Loaded here (not only in LiveChatPage) so conversations - and their
    // unread_count for the sidebar badge - are available even if the
    // agent hasn't opened Live Chat yet this session.
    dispatch(loadConversations({ page: 1 }))

    const echo = connectEcho()
    const channelName = `live-chat.department.${departmentId}`

    echo
      .private(channelName)
      .listen('.message.sent', (payload) => {
        const { currentPath: path, selectedId: openId, conversations: knownConversations } = contextRef.current

        // An agent is scoped to their own assigned conversations only
        // (see ConversationService::isOutOfScope on the backend) - a
        // waiting/unassigned conversation, or one assigned to a
        // colleague, is never in their own conversations list, so a
        // message for one shouldn't be stored or dinged for them either.
        if (userRole === 'agent' && !knownConversations.some((conversation) => conversation.id === payload.conversation_id)) {
          return
        }

        dispatch(messageReceived({ conversationId: payload.conversation_id, message: payload }))

        const isViewingThisConversation = path === '/live-chat' && openId === payload.conversation_id

        if (payload.sender_type === 'visitor' && !isViewingThisConversation) {
          playNotificationSound()
        }
      })
      // The department channel fans out every conversation in the
      // department (that's what lets supervisors see everything) - a
      // plain agent must drop anything not assigned to them specifically
      // here, including the unassigned/waiting queue, or the "agents
      // only see their own assigned conversations" scoping the backend
      // enforces over REST would be silently defeated by this live-update
      // path.
      .listen('.conversation.created', (payload) => {
        if (userRole === 'agent' && payload.assigned_agent?.id !== userId) {
          return
        }

        dispatch(conversationReceived(payload))
      })

    return () => {
      echo.leave(channelName)
    }
  }, [dispatch, departmentId, userRole, userId])

  // Runs only when the caller (DashboardLayout) unmounts - i.e. on logout -
  // so the socket stays open across page navigation within the session.
  useEffect(() => disconnectEcho, [])
}

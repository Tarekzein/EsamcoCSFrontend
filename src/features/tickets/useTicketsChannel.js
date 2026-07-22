import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { connectEcho } from '../../lib/echo'
import { playNotificationSound } from '../../lib/notificationSound'
import { loadTicketStats, ticketCommentAppended, ticketUpserted } from './ticketsSlice'

// How long to coalesce stat refreshes. Ticket events can arrive in bursts
// (an assignment immediately follows a creation), and the counters are a
// cheap single request - so refetch rather than trying to increment
// counters client-side, which drifts out of sync with server-side scoping.
const STATS_REFRESH_MS = 10000

/**
 * Joins the ticket Reverb channels for the whole session.
 *
 * Mount this in exactly ONE always-mounted component (DashboardLayout),
 * alongside useLiveChatDepartmentChannel. echo.js's connection is an
 * unreference-counted singleton and pusher-js fires every `.listen()`
 * registered on a channel name, so a second mount would double-handle every
 * event.
 */
export function useTicketsChannel() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)

  const userRole = user?.role
  const userId = user?.id
  const departmentId = user?.department_id

  // Only ever read/written inside the effect below, never during render.
  const lastStatsRefreshRef = useRef(0)

  useEffect(() => {
    if (!userRole) return undefined

    const echo = connectEcho()
    const joined = []

    function refreshStats() {
      const now = Date.now()

      if (now - lastStatsRefreshRef.current < STATS_REFRESH_MS) return

      lastStatsRefreshRef.current = now
      dispatch(loadTicketStats())
    }

    // Every ticket event carries the resolved resource directly, with no
    // `data` wrapper - unlike every HTTP response in this app - because
    // the backend events return `(new TicketResource($t))->resolve()`.
    function handleTicketEvent(ticket) {
      dispatch(ticketUpserted(ticket))
      refreshStats()
    }

    function subscribe(channelName) {
      const channel = echo.private(channelName)
      joined.push(channelName)

      return channel
    }

    // Admins have no department, so there's no department channel for them
    // to join - there is no global admin ticket feed today. They still get
    // per-ticket events while a detail view is open (see below), and the
    // list/stats stay correct on navigation.
    if (departmentId) {
      subscribe(`tickets.department.${departmentId}`)
        .listen('.ticket.created', handleTicketEvent)
        .listen('.ticket.updated', handleTicketEvent)
        .listen('.ticket.assigned', handleTicketEvent)
        .listen('.ticket.escalated', handleTicketEvent)
        .listen('.ticket.comment.added', (comment) => {
          dispatch(ticketCommentAppended(comment))
        })
        .listen('.ticket.sla_response_breached', (ticket) => {
          handleTicketEvent(ticket)
          // A breach is the one ticket event worth interrupting someone
          // for - but only the people who act on it at the queue level.
          if (userRole !== 'agent') playNotificationSound()
        })
        .listen('.ticket.sla_resolution_breached', (ticket) => {
          handleTicketEvent(ticket)
          if (userRole !== 'agent') playNotificationSound()
        })
    }

    if (userRole === 'agent' && userId) {
      subscribe(`tickets.agent.${userId}`)
        .listen('.ticket.assigned', handleTicketEvent)
        .listen('.ticket.sla_response_breached', (ticket) => {
          handleTicketEvent(ticket)
          playNotificationSound()
        })
        .listen('.ticket.sla_resolution_breached', (ticket) => {
          handleTicketEvent(ticket)
          playNotificationSound()
        })
    }

    return () => {
      joined.forEach((channelName) => echo.leave(channelName))
    }
    // Keyed on primitives, not the user object - its identity changes on
    // every auth refresh, which would tear down and rejoin the channels.
  }, [dispatch, userRole, userId, departmentId])
}

/**
 * Subscribes to a single ticket's channel while its detail view is open.
 *
 * Separate from the session-long hook above because it's inherently
 * short-lived, and because `tickets.ticket.{id}` is the only ticket channel
 * that carries comment events for tickets outside the viewer's department.
 */
export function useTicketChannel(ticketId) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!ticketId) return undefined

    const echo = connectEcho()
    const channelName = `tickets.ticket.${ticketId}`

    echo
      .private(channelName)
      .listen('.ticket.updated', (ticket) => dispatch(ticketUpserted(ticket)))
      .listen('.ticket.assigned', (ticket) => dispatch(ticketUpserted(ticket)))
      .listen('.ticket.escalated', (ticket) => dispatch(ticketUpserted(ticket)))
      .listen('.ticket.comment.added', (comment) => dispatch(ticketCommentAppended(comment)))

    return () => {
      echo.leave(channelName)
    }
  }, [dispatch, ticketId])
}

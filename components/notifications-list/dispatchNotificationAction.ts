// lib/notifications/dispatchNotificationAction.ts
export function dispatchNotificationAction(type: string) {
  switch (type) {
    case "EMAIL_MISSING":
      window.dispatchEvent(new CustomEvent("open-email-dialog"))
      break
    default:
      break
  }
}

/**
 * Legacy Service Wrapper (Replaced by SMTP Email Gateway)
 * Dispatches via SMTP Gateway service for all notification triggers.
 */

import { dispatchEmail, EmailDispatchResult } from './smtp';

export interface SMSDispatchResult {
  status: 'DELIVERED' | 'SENT' | 'SIMULATED' | 'FAILED';
  recipient: string;
  trigger_event: string;
  message: string;
  simulated: boolean;
  delivery_time: string;
  response_details?: any;
}

export async function dispatchSMS(
  phoneNumberOrEmail: string,
  message: string,
  triggerEvent: string = 'General Notification'
): Promise<SMSDispatchResult> {
  const result: EmailDispatchResult = await dispatchEmail(
    phoneNumberOrEmail,
    `DEVORA NOTIFICATION: ${triggerEvent}`,
    message,
    { triggerEvent }
  );

  return {
    status: result.status,
    recipient: phoneNumberOrEmail,
    trigger_event: triggerEvent,
    message,
    simulated: result.simulated,
    delivery_time: result.delivery_time,
    response_details: result.response_details
  };
}

/**
 * toastService — Global notification system (SERVICE-002)
 *
 * Wraps the store's addToast / removeToast actions.
 * Import this instead of calling the store directly so call-sites
 * stay decoupled from state management.
 */

function getStore() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@/shared/store').useStore;
}

function dispatch(
  type: 'success' | 'error' | 'info' | 'warning',
  message: string,
  duration = 4000,
) {
  getStore().getState().addToast({ type, message, duration });
}

export const toastService = {
  success(message: string, duration?: number) {
    dispatch('success', message, duration);
  },
  error(message: string, duration?: number) {
    dispatch('error', message, duration);
  },
  info(message: string, duration?: number) {
    dispatch('info', message, duration);
  },
  warning(message: string, duration?: number) {
    dispatch('warning', message, duration);
  },
  dismiss(id: string) {
    getStore().getState().removeToast(id);
  },
};

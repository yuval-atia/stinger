import { createPortal } from 'react-dom';

function InternalToast({ toasts }) {
  if (!toasts || toasts.length === 0) return null;

  return createPortal(
    <div className="sjt">
      <div className="sjt-fixed sjt-top-4 sjt-right-4 sjt-z-[9999] sjt-flex sjt-flex-col sjt-gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="sjt-flex sjt-items-center sjt-gap-2 sjt-px-3 sjt-py-2 sjt-rounded-lg sjt-shadow-lg sjt-animate-toast-in"
            style={{
              backgroundColor: 'var(--sjt-bg-primary, #ffffff)',
              border: '1px solid var(--sjt-border-color, #e5e7eb)',
            }}
          >
            <span
              className="sjt-w-5 sjt-h-5 sjt-flex sjt-items-center sjt-justify-center sjt-rounded-full sjt-text-white sjt-text-xs"
              style={{ backgroundColor: 'var(--sjt-success-color, #22c55e)' }}
            >
              ✓
            </span>
            <span
              className="sjt-text-sm"
              style={{ color: 'var(--sjt-text-primary, #1f2937)' }}
            >
              {toast.message}
            </span>
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}

export default InternalToast;

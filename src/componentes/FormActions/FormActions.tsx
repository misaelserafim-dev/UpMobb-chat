import type { FormActionsProps } from "./FormActions.ts";
import "./FormActions.css";

export function FormActions({
  onCancel,
  submitLabel,
  cancelLabel = "Cancelar",
  disabled = false,
  submitDisabled = false,
  submitType = "submit",
  onSubmitClick,
  className = "contact-form__actions",
}: FormActionsProps) {
  return (
    <div className={className}>
      <button
        type="button"
        className="contact-form__btn contact-form__btn--ghost"
        onClick={onCancel}
        disabled={disabled}
      >
        {cancelLabel}
      </button>
      <button
        type={submitType}
        className="contact-form__btn contact-form__btn--primary"
        disabled={disabled || submitDisabled}
        onClick={submitType === "button" ? onSubmitClick : undefined}
      >
        {submitLabel}
      </button>
    </div>
  );
}

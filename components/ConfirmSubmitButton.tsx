"use client";

import type { ButtonHTMLAttributes } from "react";

type ConfirmSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  confirmMessage: string;
};

// En almindelig submit-knap i en formular (fx "Annullér" eller "Slet"), som
// beder om bekræftelse ("Er du sikker?") før formularen rent faktisk sendes.
// Bruges så man ikke kommer til at klikke forkert ved et uheld.
export default function ConfirmSubmitButton({
  confirmMessage,
  onClick,
  ...buttonProps
}: ConfirmSubmitButtonProps) {
  return (
    <button
      {...buttonProps}
      type="submit"
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    />
  );
}

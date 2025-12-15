// src/features/chat/components/GroupIconPicker.jsx
import React from "react";

/**
 * Small presentational component if you want to extract icon picker separately.
 * In the split I kept picker logic in parent; this is a minimal stub in case you want to use it.
 */
export default function GroupIconPicker({
  groupIconPreview,
  onOpenPicker,
  onRemove,
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onOpenPicker}
        className="w-12 h-12 rounded-full bg-muted flex items-center justify-center cursor-pointer overflow-hidden"
      >
        {groupIconPreview ? (
          <img src={groupIconPreview} alt="Group" className="w-full h-full object-cover" />
        ) : (
          <div className="text-muted-foreground">+</div>
        )}
      </button>

      <div className="text-sm text-muted-foreground">
        Add group icon <span className="opacity-70">(optional)</span>
      </div>

      {groupIconPreview && (
        <button className="text-sm text-destructive" onClick={onRemove}>
          Remove
        </button>
      )}
    </div>
  );
}

import { ArrowLeft, LoaderCircle, Pencil, Trash2 } from "lucide-react";

type DetailTopBarBackButtonProps = {
  onBack: () => void;
};

type DetailTopBarActionButtonsProps = {
  editing: boolean;
  saving: boolean;
  deleting: boolean;
  onEditToggle: () => void;
  onDeleteRequest: () => void;
};

export function DetailTopBarBackButton({
  onBack,
}: DetailTopBarBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="joy-topbar-button shrink-0 whitespace-nowrap"
    >
      <ArrowLeft className="size-4" />
      返回
    </button>
  );
}

export function DetailTopBarActionButtons({
  editing,
  saving,
  deleting,
  onEditToggle,
  onDeleteRequest,
}: DetailTopBarActionButtonsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onEditToggle}
        disabled={saving || deleting}
        className={`joy-topbar-button ${editing ? "joy-topbar-button--primary" : ""}`}
      >
        {saving ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Pencil className="size-4" />
        )}
        编辑
      </button>
      <button
        type="button"
        data-testid="detail-delete-trigger"
        onClick={onDeleteRequest}
        disabled={saving || deleting}
        className="joy-topbar-button joy-topbar-button--danger"
      >
        {deleting ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        {deleting ? "删除中..." : "删除"}
      </button>
    </>
  );
}


import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Pencil,
  Trash2,
} from "lucide-react";

type DetailTopBarBackButtonProps = {
  onBack: () => void;
};

type DetailTopBarActionButtonsProps = {
  editing: boolean;
  saving: boolean;
  deleting: boolean;
  onEditToggle: () => void;
  onSaveRequest: () => void;
  onCancelEdit: () => void;
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
  onSaveRequest,
  onCancelEdit,
  onDeleteRequest,
}: DetailTopBarActionButtonsProps) {
  if (editing) {
    return (
      <>
        <button
          type="button"
          onClick={onSaveRequest}
          disabled={saving || deleting}
          className="joy-topbar-button joy-topbar-button--primary"
        >
          {saving ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
          {saving ? "保存中..." : "保存修改"}
        </button>
        <button
          type="button"
          onClick={onCancelEdit}
          disabled={saving || deleting}
          className="joy-topbar-button"
        >
          取消编辑
        </button>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onEditToggle}
        disabled={saving || deleting}
        className="joy-topbar-button"
      >
        <Pencil className="size-4" />
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

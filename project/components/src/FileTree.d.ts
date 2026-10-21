export interface FileTreeProps extends React.HTMLAttributes<HTMLUListElement> {
  /** FileTree.Folder and FileTree.File items. */
  children?: React.ReactNode;
}
export interface FileTreeFolderProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, 'onChange'> {
  name: string;
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}
export interface FileTreeFileProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'type'> {
  name: string;
  /** Makes the row a link. */
  href?: string;
  /** Swaps the file icon for a function, lambda or middleware icon. */
  type?: 'file' | 'edge-function' | 'lambda' | 'middleware';
  /** hyprsh: marks the current file (aria-current="page"). */
  active?: boolean;
}
export declare const FileTree: ((props: FileTreeProps) => React.ReactElement) & {
  Folder: (props: FileTreeFolderProps) => React.ReactElement;
  File: (props: FileTreeFileProps) => React.ReactElement;
};

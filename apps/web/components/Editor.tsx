"use client";

import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect } from "react";
import { Toolbar } from "./Toolbar";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageUpload: (file: File) => Promise<string | null>;
}

export function Editor({ content, onChange, onImageUpload }: EditorProps) {
  const ImageResizeComponent = ({ node, updateAttributes, selected }: any) => {
    const width = parseInt(node.attrs.width || "320", 10);

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;

      const onMouseMove = (event: MouseEvent) => {
        const delta = event.clientX - startX;
        const newWidth = Math.max(160, startWidth + delta);
        updateAttributes({ width: `${newWidth}px` });
      };

      const onMouseUp = () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    return (
      <NodeViewWrapper
        className="position-relative d-inline-block"
        draggable
        data-drag-handle
      >
        <img
          src={node.attrs.src}
          style={{ width: `${width}px`, maxWidth: "100%", height: "auto" }}
          className="rounded-3 shadow-sm border border-memo-line"
          draggable
          alt=""
        />
        <span
          className={`position-absolute bottom-0 end-0 translate-middle p-1 rounded bg-white border border-memo-line shadow-sm ${
            selected ? "" : "opacity-75"
          }`}
          style={{ cursor: "ew-resize" }}
          onMouseDown={handleMouseDown}
          title="Drag to resize"
        >
          ⋮⋮
        </span>
      </NodeViewWrapper>
    );
  };

  const ResizableImage = Image.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        width: {
          default: "320px",
          renderHTML: (attributes) => ({
            style: `width: ${attributes.width}; max-width: 100%; height: auto;`,
          }),
        },
        draggable: {
          default: true,
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(ImageResizeComponent);
    },
    parseHTML() {
      return [
        {
          tag: "img[src]",
          getAttrs: (node) => {
            if (typeof node === "string") return {};
            return {
              src: (node as HTMLElement).getAttribute("src"),
              width: (node as HTMLElement).style.width || "320px",
            };
          },
        },
      ];
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-memo-wood underline cursor-pointer",
        },
      }),
      ResizableImage.configure({
        inline: true,
        HTMLAttributes: {
          class: "rounded-3 shadow-sm border border-memo-line object-contain",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your note...",
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap bg-white min-h-full px-4 px-md-5 py-4 focus:outline-none rounded-3 border border-memo-line shadow-sm",
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer?.files.length) {
          const files = Array.from(event.dataTransfer.files);
          const images = files.filter((file) => file.type.startsWith("image/"));
          
          if (images.length > 0) {
            event.preventDefault();
            images.forEach(async (image) => {
              const url = await onImageUpload(image);
              if (url && editor) {
                editor.chain().focus().setImage({ src: url, width: "320px" } as any).run();
              }
            });
            return true;
          }
        }
        return false;
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.type.startsWith("image/")) {
              event.preventDefault();
              const file = item.getAsFile();
              if (file) {
                onImageUpload(file).then((url) => {
                  if (url && editor) {
                    editor.chain().focus().setImage({ src: url, width: "320px" } as any).run();
                  }
                });
              }
              return true;
            }
          }
        }
        return false;
      },
    },
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const addImage = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = await onImageUpload(file);
        if (url && editor) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }
    };
    input.click();
  }, [editor, onImageUpload]);

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes("link").href;
    const url = prompt("Enter URL:", previousUrl);
    
    if (url === null) return;
    
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <>
      <Toolbar editor={editor} onAddImage={addImage} onSetLink={setLink} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </>
  );
}

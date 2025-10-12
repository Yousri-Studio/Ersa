'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  maxLength?: number;
}

export function RichTextEditor({ value, onChange, placeholder, dir = 'ltr', maxLength }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2',
        dir: dir,
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const currentLength = editor.getText().length;
  const isOverLimit = maxLength && currentLength > maxLength;

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('bold') ? 'bg-gray-300' : ''
          }`}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('italic') ? 'bg-gray-300' : ''
          }`}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('underline') ? 'bg-gray-300' : ''
          }`}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('strike') ? 'bg-gray-300' : ''
          }`}
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 text-sm ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 text-sm ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 text-sm ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
          }`}
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 text-sm ${
            editor.isActive('paragraph') ? 'bg-gray-300' : ''
          }`}
          title="Paragraph"
        >
          P
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('bulletList') ? 'bg-gray-300' : ''
          }`}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('orderedList') ? 'bg-gray-300' : ''
          }`}
          title="Numbered List"
        >
          1.
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Other Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('blockquote') ? 'bg-gray-300' : ''
          }`}
          title="Quote"
        >
          "
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="px-2 py-1 rounded hover:bg-gray-200"
          title="Horizontal Line"
        >
          ―
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Undo (Ctrl+Z)"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Redo (Ctrl+Y)"
        >
          ↷
        </button>
      </div>

      {/* Editor Content */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Character Counter */}
      {maxLength && (
        <div className={`px-3 py-1 text-xs text-right border-t border-gray-200 ${
          isOverLimit ? 'text-red-600 bg-red-50' : 'text-gray-500 bg-gray-50'
        }`}>
          {currentLength} / {maxLength} {isOverLimit && '(exceeds limit)'}
        </div>
      )}
    </div>
  );
}


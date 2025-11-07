'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import { useEffect, useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  maxLength?: number;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, dir = 'ltr', maxLength, disabled = false }: RichTextEditorProps) {
  const [textDirection, setTextDirection] = useState<'ltr' | 'rtl'>(dir);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const linkDialogRef = useRef<HTMLDivElement>(null);

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
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[150px] px-3 py-2',
        dir: textDirection,
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Update editor editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  // Update text direction when prop changes
  useEffect(() => {
    setTextDirection(dir);
  }, [dir]);

  // Update editor direction attribute when textDirection changes
  useEffect(() => {
    if (editor) {
      editor.view.dom.setAttribute('dir', textDirection);
    }
  }, [editor, textDirection]);

  // Close link dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLinkDialog && linkDialogRef.current && !linkDialogRef.current.contains(event.target as Node)) {
        setShowLinkDialog(false);
        setLinkUrl('');
        setLinkText('');
      }
    };

    if (showLinkDialog) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLinkDialog]);

  // Handle link insertion
  const handleInsertLink = () => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    if (selectedText) {
      setLinkText(selectedText);
    } else {
      setLinkText('');
    }

    // Check if we're in a link
    const linkAttributes = editor.getAttributes('link');
    if (linkAttributes.href) {
      setLinkUrl(linkAttributes.href);
    } else {
      setLinkUrl('');
    }

    setShowLinkDialog(true);
  };

  const handleApplyLink = () => {
    if (!editor || !linkUrl.trim()) return;

    const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') 
      ? linkUrl 
      : `https://${linkUrl}`;

    if (linkText.trim()) {
      // Insert new link with text
      editor.chain().focus().insertContent(`<a href="${url}">${linkText}</a>`).run();
    } else {
      // Apply link to selected text or insert URL
      const { from, to } = editor.state.selection;
      if (from !== to) {
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run();
      }
    }

    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
  };

  const toggleTextDirection = () => {
    const newDirection = textDirection === 'ltr' ? 'rtl' : 'ltr';
    setTextDirection(newDirection);
  };

  if (!editor) {
    return null;
  }

  const currentLength = editor.getText().length;
  const isOverLimit = maxLength && currentLength > maxLength;

  return (
    <div className={`border border-gray-300 rounded-md overflow-visible ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1 relative">
        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('bold') ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('italic') ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('underline') ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('strike') ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Strikethrough"
        >
          <s>S</s>
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 text-sm ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 text-sm ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 text-sm ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setParagraph().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 text-sm ${
            editor.isActive('paragraph') ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Paragraph"
        >
          P
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('bulletList') ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('orderedList') ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Numbered List"
        >
          1.
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Other Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('blockquote') ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Quote"
        >
          "
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Horizontal Line"
        >
          ―
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Link */}
        <button
          type="button"
          onClick={handleInsertLink}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            editor.isActive('link') ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Insert Link (Ctrl+K)"
        >
          🔗
        </button>

        {/* Text Direction */}
        <button
          type="button"
          onClick={toggleTextDirection}
          disabled={disabled}
          className={`px-2 py-1 rounded hover:bg-gray-200 ${
            textDirection === 'rtl' ? 'bg-gray-300' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={`Text Direction: ${textDirection === 'rtl' ? 'RTL' : 'LTR'}`}
        >
          {textDirection === 'rtl' ? '⇐' : '⇒'}
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

      {/* Link Dialog */}
      {showLinkDialog && (
        <div ref={linkDialogRef} className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 mt-2 left-0 right-0 mx-auto min-w-[300px] max-w-[400px]">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyLink();
                  } else if (e.key === 'Escape') {
                    setShowLinkDialog(false);
                  }
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link Text (optional)
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyLink();
                  } else if (e.key === 'Escape') {
                    setShowLinkDialog(false);
                  }
                }}
              />
            </div>
            <div className="flex gap-2 justify-end">
              {editor?.isActive('link') && (
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  Remove Link
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowLinkDialog(false)}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                disabled={!linkUrl.trim()}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="bg-white relative">
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


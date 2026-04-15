'use client';

import React, { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import './CustomEditor.css';
import {
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
  FaMinus, FaListOl, FaListUl, FaRegSquare, FaTable,
  FaSmile, FaSearch, FaFont, FaFillDrip,
} from 'react-icons/fa';
import { throttle } from 'lodash';

interface CustomEditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
}

interface SavedSelection {
  startPath: number[];
  startOffset: number;
  endPath: number[];
  endOffset: number;
}

const CustomEditor: React.FC<CustomEditorProps> = ({ value = '', onChange, placeholder = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findValue, setFindValue] = useState('');
  const [replaceValue, setReplaceValue] = useState('');
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showSpecialCharPanel, setShowSpecialCharPanel] = useState(false);
  const [showTablePanel, setShowTablePanel] = useState(false);
  const [currentFont, setCurrentFont] = useState('');
  const [currentSize, setCurrentSize] = useState('');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentLineHeight, setCurrentLineHeight] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [currentLetterSpacing, setCurrentLetterSpacing] = useState('');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [sourceContent, setSourceContent] = useState('');
  const [internalHtml, setInternalHtml] = useState(value || '');
  const [imageWidth, setImageWidth] = useState('');
  const [imageHeight, setImageHeight] = useState('');
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(
    throttle((html: string) => {
      if (onChange) onChange(html);
    }, 500),
    [onChange]
  );

  const saveHistory = useCallback(() => {
    if (editorRef.current) {
      setHistory((prev) => [...prev, editorRef.current!.innerHTML]);
      setRedoStack([]);
    }
  }, []);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setRedoStack((prev) => [editorRef.current!.innerHTML, ...prev]);
    setInternalHtml(last);
    setHistory(history.slice(0, -1));
  }, [history]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory((prev) => [...prev, editorRef.current!.innerHTML]);
    setInternalHtml(next);
    setRedoStack(redoStack.slice(1));
  }, [redoStack]);

  const cleanHtml = useCallback((html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const fonts = temp.querySelectorAll('font');
    fonts.forEach((font) => {
      const span = document.createElement('span');
      const color = font.getAttribute('color');
      if (color) span.style.color = color;
      const face = font.getAttribute('face');
      if (face) span.style.fontFamily = face;
      const size = font.getAttribute('size');
      if (size) {
        const num = parseInt(size, 10);
        if (!isNaN(num) && num >= 1 && num <= 7) {
          const pxSizes = [10, 12, 14, 16, 18, 24, 36];
          span.style.fontSize = `${pxSizes[num - 1]}px`;
        }
      }
      while (font.firstChild) span.appendChild(font.firstChild);
      font.parentNode?.replaceChild(span, font);
    });
    temp.querySelectorAll<HTMLElement>('[style]').forEach((el) => {
      if (el.getAttribute('style')?.trim() === '') el.removeAttribute('style');
    });
    return temp.innerHTML;
  }, []);

  const saveSelection = useCallback((): SavedSelection | null => {
    const sel = window.getSelection();
    if (!sel?.rangeCount || !editorRef.current) return null;
    const range = sel.getRangeAt(0);
    const getPath = (node: Node): number[] => {
      const path: number[] = [];
      let current: Node | null = node;
      while (current && current !== editorRef.current) {
        const parentNode: Node | null = current.parentNode;
        if (parentNode) {
          path.unshift(Array.prototype.indexOf.call(parentNode.childNodes, current));
          current = parentNode;
        } else break;
      }
      return path;
    };
    return {
      startPath: getPath(range.startContainer),
      startOffset: range.startOffset,
      endPath: getPath(range.endContainer),
      endOffset: range.endOffset,
    };
  }, []);

  const restoreSelection = useCallback((savedSel: SavedSelection | null) => {
    if (!savedSel || !editorRef.current) return;
    const { startPath, startOffset, endPath, endOffset } = savedSel;
    const getNodeFromPath = (path: number[]): Node => {
      let node: Node = editorRef.current!;
      for (const index of path) node = node.childNodes[index] || node;
      return node;
    };
    try {
      const startNode = getNodeFromPath(startPath);
      const endNode = getNodeFromPath(endPath);
      if (!startNode || !endNode) return;
      const sel = window.getSelection();
      const range = document.createRange();
      range.setStart(startNode, Math.min(startOffset, startNode.nodeType === Node.TEXT_NODE ? (startNode as Text).length : startNode.childNodes.length));
      range.setEnd(endNode, Math.min(endOffset, endNode.nodeType === Node.TEXT_NODE ? (endNode as Text).length : endNode.childNodes.length));
      sel?.removeAllRanges();
      sel?.addRange(range);
    } catch (e) {
      console.warn('Failed to restore selection:', e);
    }
  }, []);

  const updateCurrentFormatting = useCallback(() => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    let node: Node | null = selection.anchorNode;
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    if (!node || !editorRef.current?.contains(node)) return;
    let block: Node | null = node;
    while (block && block !== editorRef.current && !['DIV', 'P', 'LI'].includes((block as Element).nodeName)) block = block.parentNode;
    let inline: Node | null = node;
    while (inline && inline !== editorRef.current && (inline as Element).nodeName !== 'SPAN') inline = inline.parentNode;
    const blockEl = block as HTMLElement | null;
    const inlineEl = inline as HTMLElement | null;
    let size = inlineEl?.style?.fontSize || blockEl?.style?.fontSize || '';
    const validSizes = ['8','9','10','11','12','14','16','18','20','22','24','26','28','32','36','40','48','60','72'];
    size = size.replace('px', '');
    setCurrentSize(validSizes.includes(size) ? size : '');
    let family = inlineEl?.style?.fontFamily || blockEl?.style?.fontFamily || window.getComputedStyle(node as Element).fontFamily || '';
    family = family.replace(/['"]/g, '').split(',')[0].trim();
    setCurrentFont(family);
    let lh = blockEl?.style?.lineHeight || window.getComputedStyle(node as Element).lineHeight || '';
    const validLH = ['1.0','1.15','1.3','1.5','1.75','2.0'];
    setCurrentLineHeight(validLH.includes(lh) ? lh : '');
    let ls = inlineEl?.style?.letterSpacing || window.getComputedStyle(node as Element).letterSpacing || '';
    ls = ls.replace('px', '');
    const validLS = Array.from({ length: 11 }, (_, i) => String(i - 5));
    setCurrentLetterSpacing(validLS.includes(ls) ? ls : '');
    const color = inlineEl?.style?.color || window.getComputedStyle(node as Element).color || '';
    const match = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) {
      setCurrentColor(`#${((1 << 24) + (parseInt(match[1]) << 16) + (parseInt(match[2]) << 8) + parseInt(match[3])).toString(16).slice(1).padStart(6, '0')}`);
    } else if (color) setCurrentColor(color);
  }, []);

  const handleInput = useCallback((forceCleanup = false) => {
    if (!editorRef.current) return;
    const savedSel = saveSelection();
    const rawHtml = editorRef.current.innerHTML;
    let newHtml = rawHtml;
    if (forceCleanup) {
      newHtml = cleanHtml(rawHtml);
      if (rawHtml !== newHtml) {
        editorRef.current.innerHTML = newHtml;
        restoreSelection(savedSel);
      }
    }
    setInternalHtml(newHtml);
    debouncedOnChange(newHtml);
    updateCurrentFormatting();
  }, [cleanHtml, debouncedOnChange, updateCurrentFormatting, restoreSelection, saveSelection]);

  const format = useCallback((command: string, val: string | null = null) => {
    saveHistory();
    document.execCommand(command, false, val ?? undefined);
    handleInput(true);
  }, [saveHistory, handleInput]);

  const insertContent = useCallback((content: string) => {
    if (editorRef.current) {
      saveHistory();
      editorRef.current.focus();
      document.execCommand('insertText', false, content);
      handleInput(true);
    }
  }, [saveHistory, handleInput]);

  const applyFontSize = useCallback((size: string) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const textNode = walker.currentNode as Text;
      if (textNode.nodeValue?.trim() === '') continue;
      const parent = textNode.parentNode as HTMLElement;
      if (parent?.nodeName === 'SPAN') {
        parent.style.fontSize = `${size}px`;
      } else {
        const span = document.createElement('span');
        span.style.fontSize = `${size}px`;
        parent?.replaceChild(span, textNode);
        span.appendChild(textNode);
      }
    }
    range.deleteContents();
    range.insertNode(frag);
    handleInput(true);
    setCurrentSize(String(size));
  }, [saveHistory, handleInput]);

  const applyFontFamily = useCallback((family: string) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const textNode = walker.currentNode as Text;
      if (textNode.nodeValue?.trim() === '') continue;
      const parent = textNode.parentNode as HTMLElement;
      if (parent?.nodeName === 'SPAN') {
        parent.style.fontFamily = family;
      } else {
        const span = document.createElement('span');
        span.style.fontFamily = family;
        parent?.replaceChild(span, textNode);
        span.appendChild(textNode);
      }
    }
    range.deleteContents();
    range.insertNode(frag);
    handleInput(true);
    setCurrentFont(family);
  }, [saveHistory, handleInput]);

  const applyLineHeight = useCallback((lh: string) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    let block: Node | null = range.startContainer;
    while (block && block !== editorRef.current && !['DIV', 'P', 'LI'].includes((block as Element).nodeName)) block = block.parentNode;
    if (block && (block as HTMLElement).style) {
      (block as HTMLElement).style.lineHeight = lh;
      handleInput(true);
      setCurrentLineHeight(String(lh));
    }
  }, [saveHistory, handleInput]);

  const applyTextColor = useCallback((color: string) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    saveHistory();
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const textNode = walker.currentNode as Text;
      if (textNode.nodeValue?.trim() === '') continue;
      const parent = textNode.parentNode as HTMLElement;
      if (parent?.nodeName === 'SPAN') {
        parent.style.color = color;
      } else {
        const span = document.createElement('span');
        span.style.color = color;
        parent?.replaceChild(span, textNode);
        span.appendChild(textNode);
      }
    }
    range.deleteContents();
    range.insertNode(frag);
    handleInput(true);
    setCurrentColor(color);
  }, [saveHistory, handleInput]);

  const collapseCaretToEnd = useCallback(() => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const applyLetterSpacing = useCallback((spacing: string) => {
    if (!editorRef.current) return;
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    saveHistory();
    const val = String(spacing).trim();
    if (!val) { setCurrentLetterSpacing(''); return; }
    const range = selection.getRangeAt(0);
    if (range.collapsed) return;
    const frag = range.extractContents();
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const textNode = walker.currentNode as Text;
      if (textNode.nodeValue?.trim() === '') continue;
      const parent = textNode.parentNode as HTMLElement;
      if (parent?.nodeName === 'SPAN') {
        parent.style.letterSpacing = `${val}px`;
      } else {
        const span = document.createElement('span');
        span.style.letterSpacing = `${val}px`;
        parent?.replaceChild(span, textNode);
        span.appendChild(textNode);
      }
    }
    range.insertNode(frag);
    collapseCaretToEnd();
    handleInput(true);
    setCurrentLetterSpacing(val);
  }, [saveHistory, handleInput, collapseCaretToEnd]);

  const changeCase = useCallback((type: string) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    saveHistory();
    const text = selection.getRangeAt(0).toString();
    let newText = text;
    if (type === 'upper') newText = text.toUpperCase();
    if (type === 'lower') newText = text.toLowerCase();
    if (type === 'capitalize') newText = text.replace(/\b\w/g, (c) => c.toUpperCase());
    document.execCommand('insertText', false, newText);
    handleInput(true);
  }, [saveHistory, handleInput]);

  const applyBorder = useCallback((type: string) => {
    const selection = window.getSelection();
    if (!selection?.rangeCount) return;
    saveHistory();
    const node = (selection.anchorNode?.parentElement) as HTMLElement;
    if (!node) return;
    switch (type) {
      case 'borderBottom': node.style.borderBottom = '1px solid black'; break;
      case 'borderTop':    node.style.borderTop    = '1px solid black'; break;
      case 'borderLeft':   node.style.borderLeft   = '1px solid black'; break;
      case 'borderRight':  node.style.borderRight  = '1px solid black'; break;
      case 'borderAll':    node.style.border        = '1px solid black'; break;
      case 'noBorder':
        node.style.border = node.style.borderTop = node.style.borderBottom = node.style.borderLeft = node.style.borderRight = '';
        break;
    }
    handleInput(true);
  }, [saveHistory, handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveHistory();
      e.preventDefault();
      const selection = window.getSelection();
      if (!selection?.rangeCount) return;
      const range = selection.getRangeAt(0);
      const newLine = document.createElement('div');
      newLine.innerHTML = '<br>';
      if (currentFont) newLine.style.fontFamily = currentFont;
      if (currentLineHeight) newLine.style.lineHeight = currentLineHeight;
      range.deleteContents();
      range.insertNode(newLine);
      const newRange = document.createRange();
      newRange.setStart(newLine, 0);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
      handleInput(true);
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand(e.shiftKey ? 'outdent' : 'indent', false, undefined);
      handleInput(true);
    }
  }, [saveHistory, handleInput, currentFont, currentLineHeight]);

  const insertTable = useCallback((rows: number, cols: number, width = '100%', height = 'auto') => {
    saveHistory();
    let table = `<table style="border-collapse:collapse;width:${width};height:${height};">`;
    for (let r = 0; r < rows; r++) {
      table += '<tr>';
      for (let c = 0; c < cols; c++) table += '<td style="padding:8px;border:1px solid #ccc;">&nbsp;</td>';
      table += '</tr>';
    }
    table += '</table><br>';
    document.execCommand('insertHTML', false, table);
    handleInput(true);
    setShowTablePanel(false);
  }, [saveHistory, handleInput]);

  const handleImageInsert = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) { saveHistory(); format('insertImage', url); }
  }, [saveHistory, format]);

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      setSelectedImage(img);
      setImageWidth(img.style.width?.replace('px', '') || String(img.width) || '');
      setImageHeight(img.style.height?.replace('px', '') || String(img.height) || '');
    }
  }, []);

  const applyImageResize = () => {
    if (!selectedImage) return;
    if (imageWidth) selectedImage.style.width = `${imageWidth}px`;
    selectedImage.style.height = imageHeight ? `${imageHeight}px` : 'auto';
    handleInput(true);
    setSelectedImage(null); setImageWidth(''); setImageHeight('');
  };

  const handleLinkInsert = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) { saveHistory(); format('createLink', url); }
  }, [saveHistory, format]);

  const handleVideoInsert = useCallback(() => {
    const code = prompt('Enter video iframe embed code:');
    if (code && editorRef.current) {
      saveHistory();
      editorRef.current.focus();
      document.execCommand('insertHTML', false, code);
      handleInput(true);
    }
  }, [saveHistory, handleInput]);

  const handleAutoFormat = useCallback(() => {
    saveHistory();
    if (!editorRef.current) return;
    let html = editorRef.current.innerHTML;
    html = html.replace(/"([^"]*)"/g, '\u201c$1\u201d').replace(/\s--\s/g, ' \u2014 ');
    setInternalHtml(cleanHtml(html));
  }, [saveHistory, cleanHtml]);

  const handleFindReplace = useCallback(() => {
    if (!editorRef.current) return;
    saveHistory();
    const html = editorRef.current.innerHTML;
    setInternalHtml(cleanHtml(html.replaceAll(findValue, replaceValue)));
    setShowFindReplace(false);
  }, [saveHistory, findValue, replaceValue, cleanHtml]);

  const handlePastePlainText = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    saveHistory();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput(true);
  }, [saveHistory, handleInput]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [undo, redo]);

  useEffect(() => {
    const handler = () => updateCurrentFormatting();
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, [updateCurrentFormatting]);

  useLayoutEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== internalHtml) {
      const savedSel = saveSelection();
      editorRef.current.innerHTML = internalHtml;
      restoreSelection(savedSel);
      updateCurrentFormatting();
    }
  }, [internalHtml, updateCurrentFormatting, saveSelection, restoreSelection]);

  useEffect(() => {
    if (value !== internalHtml && value !== '') {
      const cleaned = cleanHtml(value);
      setInternalHtml(cleaned);
      setHistory([cleaned]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const TB = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button type="button" onClick={onClick} title={title}>{children}</button>
  );

  return (
    <div className="editor-container">
      <div className="toolbar">
        <TB onClick={undo} title="Undo">↺</TB>
        <TB onClick={redo} title="Redo">↻</TB>
        <TB onClick={() => document.execCommand('selectAll')} title="Select All">All</TB>
        <TB onClick={handleAutoFormat} title="Autoformat">✨</TB>
        <TB onClick={() => window.print()} title="Print">🖨️</TB>
        <TB onClick={() => format('bold')} title="Bold"><strong>B</strong></TB>
        <TB onClick={() => format('italic')} title="Italic"><em>I</em></TB>
        <TB onClick={() => format('underline')} title="Underline"><u>U</u></TB>
        <TB onClick={() => format('strikeThrough')} title="Strikethrough"><s>S</s></TB>
        <TB onClick={() => format('superscript')} title="Superscript">x²</TB>
        <TB onClick={() => format('subscript')} title="Subscript">x₂</TB>
        <TB onClick={() => format('removeFormat')} title="Clear">🚫</TB>

        <select value={currentFont} onChange={(e) => applyFontFamily(e.target.value)}>
          <option value="">Font</option>
          {['Arial','Calibri','Cambria','Georgia','Helvetica','Times New Roman','Verdana','Trebuchet MS','Tahoma','Segoe UI','Courier New','Impact','Garamond','Bookman','Century Gothic','Playfair Display'].map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <select value={currentSize} onChange={(e) => applyFontSize(e.target.value)}>
          <option value="">Size</option>
          {[8,9,10,11,12,14,16,18,20,22,24,26,28,32,36,40,48,60,72].map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="editor-toolbar-section">
          <div className="toolbar-button">
            <FaFont size={14} title="Text Color" />
            <input type="color" value={currentColor} onChange={(e) => { applyTextColor(e.target.value); setCurrentColor(e.target.value); }} className="color-input" title="Text Color" />
            <input type="text" value={currentColor} onChange={(e) => { setCurrentColor(e.target.value); applyTextColor(e.target.value); }} placeholder="#000000" className="hex-input" />
          </div>
          <div className="toolbar-button">
            <FaFillDrip size={14} title="Highlight" />
            <input type="color" onChange={(e) => format('hiliteColor', e.target.value)} className="color-input" title="Background Color" />
          </div>
        </div>

        <select onChange={(e) => format('formatBlock', e.target.value)}>
          <option value="">Heading</option>
          {['H1','H2','H3','H4','H5','H6'].map(h => <option key={h} value={h}>{h}</option>)}
          <option value="BLOCKQUOTE">Quote</option>
        </select>

        <TB onClick={() => format('insertHorizontalRule')} title="HR"><FaMinus /></TB>
        <TB onClick={() => format('justifyLeft')} title="Left"><FaAlignLeft /></TB>
        <TB onClick={() => format('justifyCenter')} title="Center"><FaAlignCenter /></TB>
        <TB onClick={() => format('justifyRight')} title="Right"><FaAlignRight /></TB>
        <TB onClick={() => format('justifyFull')} title="Justify"><FaAlignJustify /></TB>
        <TB onClick={handleImageInsert} title="Image">🖼️</TB>
        <TB onClick={handleVideoInsert} title="Video">📹</TB>
        <TB onClick={handleLinkInsert} title="Link">🔗</TB>
        <TB onClick={() => format('unlink')} title="Unlink">🔓</TB>
        <TB onClick={() => format('insertOrderedList')} title="OL"><FaListOl /></TB>
        <TB onClick={() => format('insertUnorderedList')} title="UL"><FaListUl /></TB>
        <TB onClick={() => document.execCommand('insertText', false, '☐ ')} title="Todo"><FaRegSquare /></TB>
        <TB onClick={() => setShowTablePanel(!showTablePanel)} title="Table"><FaTable /></TB>
        <TB onClick={() => setShowEmojiPanel(!showEmojiPanel)} title="Emoji"><FaSmile /></TB>
        <TB onClick={() => setShowSpecialCharPanel(!showSpecialCharPanel)} title="Special">Ω</TB>
        <TB onClick={() => setShowFindReplace(!showFindReplace)} title="Find"><FaSearch /></TB>

        <select onChange={(e) => changeCase(e.target.value)}>
          <option value="">Case</option>
          <option value="upper">UPPER</option>
          <option value="lower">lower</option>
          <option value="capitalize">Capitalize</option>
        </select>

        <TB onClick={() => format('indent')} title="Indent">→</TB>
        <TB onClick={() => format('outdent')} title="Outdent">←</TB>

        <select onChange={(e) => applyBorder(e.target.value)}>
          <option value="">Border</option>
          <option value="borderBottom">Bottom</option>
          <option value="borderTop">Top</option>
          <option value="borderLeft">Left</option>
          <option value="borderRight">Right</option>
          <option value="borderAll">All</option>
          <option value="noBorder">None</option>
        </select>

        <select value={currentLineHeight} onChange={(e) => applyLineHeight(e.target.value)}>
          <option value="">Line H</option>
          {['1.0','1.15','1.3','1.5','1.75','2.0'].map(lh => <option key={lh} value={lh}>{lh}</option>)}
        </select>

        <select value={currentLetterSpacing} onChange={(e) => applyLetterSpacing(e.target.value)}>
          <option value="">Spacing</option>
          {Array.from({ length: 11 }, (_, i) => i - 5).map(v => <option key={v} value={v}>{v}px</option>)}
        </select>

        <TB onClick={() => { setSourceContent(editorRef.current?.innerHTML || ''); setIsSourceModalOpen(true); }} title="Source">{'</>'}</TB>
      </div>

      {/* Panels */}
      {showFindReplace && (
        <div className="find-replace-bar">
          <input placeholder="Find" value={findValue} onChange={(e) => setFindValue(e.target.value)} />
          <input placeholder="Replace" value={replaceValue} onChange={(e) => setReplaceValue(e.target.value)} />
          <button type="button" onClick={handleFindReplace}>Replace</button>
        </div>
      )}

      {selectedImage && (
        <div className="find-replace-bar">
          <input type="number" placeholder="Width (px)" value={imageWidth} onChange={(e) => setImageWidth(e.target.value)} style={{ width: 90 }} />
          <input type="number" placeholder="Height (px)" value={imageHeight} onChange={(e) => setImageHeight(e.target.value)} style={{ width: 90 }} />
          <button type="button" onClick={applyImageResize}>Apply Size</button>
        </div>
      )}

      {showEmojiPanel && (
        <div className="find-replace-bar">
          {['😀','😁','😂','🤣','😎','😍','😘','🤔','👍','🙏','🔥','🎉','💡','❤️'].map(e => <button type="button" key={e} onClick={() => insertContent(e)}>{e}</button>)}
        </div>
      )}

      {showSpecialCharPanel && (
        <div className="find-replace-bar">
          {['©','™','€','£','¥','§','¶','•','→','←','↑','↓','∞','≠','≈'].map(c => <button type="button" key={c} onClick={() => insertContent(c)}>{c}</button>)}
        </div>
      )}

      {showTablePanel && (
        <div className="find-replace-bar" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 12 }}>Insert Table</p>
          {[1,2,3].map(r => (
            <div key={r} style={{ display: 'flex', gap: 2 }}>
              {[1,2,3].map(c => (
                <button type="button" key={c} onClick={() => insertTable(r, c)} style={{ padding: '3px 6px', fontSize: 11 }}>{r}×{c}</button>
              ))}
            </div>
          ))}
          <button type="button" onClick={() => insertTable(8, 4)} style={{ marginTop: 6, padding: '4px 10px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
            Insert 4×8 Table
          </button>
        </div>
      )}

      {/* Editable area */}
      <div
        className="editor"
        contentEditable
        ref={editorRef}
        suppressContentEditableWarning
        spellCheck
        data-placeholder={placeholder}
        onInput={() => handleInput()}
        onBlur={() => handleInput(true)}
        onPaste={handlePastePlainText}
        onClick={handleImageClick}
        onKeyDown={handleKeyDown}
      />

      {/* Source modal */}
      {isSourceModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', width: '80%', maxWidth: 800, padding: 20, borderRadius: 8, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <strong>Source Code</strong>
              <button type="button" onClick={() => setIsSourceModalOpen(false)}>✕ Close</button>
            </div>
            <textarea value={sourceContent} onChange={(e) => setSourceContent(e.target.value)} style={{ width: '100%', height: 400, fontFamily: 'monospace', fontSize: 13, padding: 10, border: '1px solid #d1d5db', borderRadius: 4 }} />
            <button type="button" style={{ marginTop: 10, padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              onClick={() => { setInternalHtml(cleanHtml(sourceContent)); setIsSourceModalOpen(false); }}>
              Apply Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomEditor;

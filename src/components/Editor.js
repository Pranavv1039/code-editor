// CodeEditor.js
import React, { useRef } from 'react';
import MonacoEditor from '@monaco-editor/react';

const CodeEditor = ({ language, value, onChange }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.updateOptions({
      fontSize: 14,
      readOnly: false,
      minimap: { enabled: false },
    });
  editor.onDidChangeModel(()=>{
    console.timeLog('ioy')
  })
  }
  
  return (
    <div className='editorWrap'>
      <MonacoEditor
        height="90vh"
        language={language}
        value={value}
        onChange={onChange}
        theme="vs-dark"
        editorDidMount={handleEditorDidMount}
      />
    </div>
  );
};

export default CodeEditor;

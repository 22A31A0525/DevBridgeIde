import React from 'react';
import Editor from '@monaco-editor/react';

const MonacoCodeEditor = ({ code, selectedLanguage, selectedTheme, handleEditorChange }) => {
    return (
     
<div className="lg:w-3/4 flex-grow rounded-lg overflow-hidden border border-gray-700 shadow-xl min-h-[0px] max-h-screen md:max-lg:min-h-[400px] md:max-lg:max-h-[400px] md:max-lg:w-[85%]">
    {/* min-h-0 is crucial for flex items to correctly constrain their size within a flex container if content overflows */}
    <Editor
        height="100%"
        language={selectedLanguage}
        theme={selectedTheme}
        value={code}
        onChange={handleEditorChange}
        options={{
            fontSize: 16,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                arrowSize: 8,
                verticalSliderSize: 8,
                horizontalSliderSize: 8,
                verticalScrollbarColor: '#3d3d3d',
                horizontalScrollbarColor: '#3d3d3d',
                verticalSliderColor: '#6b6b6b',
                horizontalSliderColor: '#6b6b6b',
            }
        }}
    />
</div>
    );
};

export default MonacoCodeEditor;

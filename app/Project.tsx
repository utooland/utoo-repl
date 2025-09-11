import React, { useMemo } from 'react';
import { Editor } from './components/Editor';
import { FileTreeItem } from './components/FileTree';
import { Panel } from './components/Panel';
import { Preview } from './components/Preview';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Timer } from './components/Timer';
import { useBuild } from './hooks/useBuild';
import { useFileContent } from './hooks/useFileContent';
import { useFileTree } from './hooks/useFileTree';
import { useUtooProject } from './hooks/useUtooProject';
import './styles.css';

const Project = () => {
  const { project, isLoading, error: projectError, initProgress, initMessage, initTime } = useUtooProject();
  const { fileTree, handleDirectoryExpand } = useFileTree(project);
  const {
    selectedFilePath,
    selectedFileContent,
    setSelectedFileContent,
    previewUrl,
    updatePreviewUrl,
    fetchFileContent,
    error: fileContentError,
  } = useFileContent(project);

  const previewRef = React.useRef<{ reload: () => void }>(null);

  const {
    isBuilding,
    handleBuild,
    error: buildError,
    buildProgress,
    buildMessage,
    buildTime,
  } = useBuild(
    project,
    fileTree,
    handleDirectoryExpand,
    () => {
      if (previewRef.current) {
        previewRef.current.reload();
      }
    },
    (url: string) => {
      // Automatically set the preview URL after build is complete
      updatePreviewUrl(url);
    }
  );

  const error = projectError || fileContentError || buildError;

  const memoizedFileTree = useMemo(() => fileTree, [fileTree]);

  const buildButton = (
    <Button
      onClick={handleBuild}
      disabled={isBuilding || !project}
      variant='default'
      size='sm'
      className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300'
    >
      {isBuilding ? 'Building...' : 'Build'}
    </Button>
  );

  return (
    <div className='h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-foreground relative overflow-hidden'>
      {/* Tech-style background decoration */}
      <div className='absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent pointer-events-none z-0' />
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent pointer-events-none z-0' />
      <div className='absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/5 to-transparent pointer-events-none z-0' />

      {/* Main content area */}
      <div className='flex-1 flex flex-row relative z-10'>
        <Panel
          title='Project'
          actions={buildButton}
          style={{
            width: '25%',
            minWidth: '300px',
          }}
          contentStyle={{ padding: '0.5rem 1rem' }}
        >
          {error && <p style={{ textAlign: 'center', color: '#ef4444' }}>{error}</p>}
          {(isLoading || (initProgress !== undefined && initProgress > 0 && initProgress < 100)) && (
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: '#e2e8f0',
                    fontWeight: 500,
                  }}
                >
                  {initMessage || 'Initializing project...'}
                </span>
                <Timer time={initTime} format='seconds' />
              </div>
              <Progress value={initProgress || 0} className='h-1.5 bg-secondary/20' />
            </div>
          )}
          {(isBuilding || (buildProgress !== undefined && buildProgress > 0)) && (
            <div style={{ marginBottom: '1rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: '#e2e8f0',
                    fontWeight: 500,
                  }}
                >
                  {buildMessage || 'Building project...'}
                </span>
                <Timer time={buildTime} format='seconds' />
              </div>
              <Progress value={buildProgress || 0} className='h-1.5 bg-secondary/20' />
            </div>
          )}
          {!isLoading && !error && (
            <ul
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                padding: 0,
                alignItems: 'flex-start',
              }}
            >
              {memoizedFileTree.map((item) => (
                <FileTreeItem
                  key={item.fullName}
                  item={item}
                  onFileClick={fetchFileContent}
                  onDirectoryExpand={item.type === 'directory' ? handleDirectoryExpand : undefined}
                  selectedFile={selectedFilePath} // Pass the selectedFilePath state here
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title='Editor'
          style={{
            width: '40%',
            minWidth: '320px',
          }}
          contentStyle={{ paddingTop: '0.5rem' }}
        >
          <Editor filePath={selectedFilePath} content={selectedFileContent} onContentChange={setSelectedFileContent} />
        </Panel>

        <Panel
          title='Preview'
          style={{
            width: '35%',
            minWidth: '320px',
          }}
          contentStyle={{ padding: 0 }}
        >
          <Preview
            ref={previewRef}
            url={previewUrl}
            isLoading={isLoading}
            isBuilding={isBuilding}
            initProgress={initProgress}
            initMessage={initMessage}
            buildProgress={buildProgress}
            buildMessage={buildMessage}
          />
        </Panel>
      </div>
      {/* Footer area */}
      <div className='flex items-center justify-between px-6 py-1 bg-card/20 backdrop-blur-sm border-t border-border/30 z-10'>
        <div className='flex items-center gap-2'>
          <img
            src='https://avatars.githubusercontent.com/u/217533135?s=200&v=4'
            alt='Utoo Logo'
            className='w-5 h-5 rounded-md shadow-lg'
          />
          <h1 className='text-md font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'>
            Utoo REPL
          </h1>
        </div>
        <div className='flex items-center gap-2 text-xs text-muted-foreground'>
          <span>Powered by</span>
          <a
            href='https://npmjs.org/@utoo/web'
            target='_blank'
            rel='noopener noreferrer'
            className='font-mono text-primary hover:text-primary/80 transition-colors'
          >
            @utoo/web
          </a>
          <span>and</span>
          <a
            href='https://nextjs.org/docs/app/api-reference/turbopack'
            target='_blank'
            rel='noopener noreferrer'
            className='font-mono text-primary hover:text-primary/80 transition-colors'
          >
            turbopack
          </a>
        </div>
      </div>
    </div>
  );
};

export default Project;

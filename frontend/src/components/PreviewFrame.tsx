import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useRef, useState } from 'react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  // In a real implementation, this would compile and render the preview
  const iframeEl = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function main() {
    const installProcess = await webContainer.spawn('npm', ['install']);

    const installExitCode = await installProcess.exit;

    if (installExitCode !== 0) {
      throw new Error("Failed to install dependencies");
    }

    installProcess.output.pipeTo(new WritableStream({
      write(data) {
        console.log(data);
      }
    }));

    const devProcess = await webContainer.spawn('npm', ['run', 'dev']);

    const devExitCode = await devProcess.exit;

    if (devExitCode !== 0) {
      throw new Error("Failed to start development server");
    }

    // Wait for `server-ready` event
     webContainer.on('server-ready', (port, url) => {
      console.log("Server is running", url);
      if(iframeEl.current){
        iframeEl.current.src = url;
      }
      setIsLoading(false);
    });
  }
  useEffect(() => {
   (async()=>{
    await  main();
   })();
  }, [webContainer, files]);

  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      {isLoading && <div className="text-center">
        <p className="mb-2">Loading...</p>
      </div>}
      {!isLoading && <iframe width={"100%"} height={"100%"} ref={iframeEl} />}
    </div>
  );
}
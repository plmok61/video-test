import { useState, useEffect } from 'react';
import {
  EncoderUiState,
  LivelyVideoClientContext,
  LivelyEncoderUiContext,
  VideoClient,
  mediaController,
  JoinBroadcastButton,
  CameraButton,
  ControlBar,
  EncoderAudioDeviceSelect,
  EncoderEchoCancellationCheckbox,
  EncoderNoiseSuppressionCheckbox,
  EncoderVideo,
  EncoderVideoDeviceSelect,
  FullscreenButton,
  LivelyCtrlContext,
  MediaContainer,
  MicrophoneButton,
  SettingsButton,
  SettingsSidebar,
  TestMicButton,
} from '@livelyvideo/video-client-web';
import logo from './logo.svg';
import './App.css';
import { tokenRefresher } from './tokenRefresher';

const livelyAuthToken = 'something-i-can-type';

const tokenOptions = {
  livelyEndpoint: "https://phil.devspace.lsea4.livelyvideo.tv",
  authUrl: "https://phil.devspace.lsea4.livelyvideo.tv/api/demo/v1/access-token",
  streamKey: "yourStreamKey", // same as call ID
  scope: "private-viewer",
  displayName: "demo",
  userId: "123",
  clientReferrer: "demo",
  streamName: "demo",
}

function App() {
  const [vc, setVc] = useState(null);
  const [encoderUi, setEncoderUi] = useState(null);
  const [callId, setCallId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        // const response = await fetch('https://phil.devspace.lsea4.livelyvideo.tv/api/auth/v1/access-tokens', { // returns 400
        const response = await fetch('https://phil.devspace.lsea4.livelyvideo.tv/api/demo/v1/access-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${livelyAuthToken}`,
          }
        });
        const tokenResponse = await response.json();
        console.log('~~~token~~~',tokenResponse);
        setToken(tokenResponse.token);
      } catch (error) {
        console.log('Error fetching token', error);
      }
    }
    fetchAccessToken();
  }, []);

  useEffect(() => {
    if (vc === null && token) {
      const opts = {
        livelyEndpoints:  ['https://phil.devspace.lsea4.livelyvideo.tv'],
        // token: tokenRefresher(tokenOptions),
        token,
        loggerConfig: {
          clientName: "video-text",
          writeLevel: "debug",
        },
      };
      setVc(new VideoClient(opts));
    }
    return () => {
      if (vc !== null) {
        vc.dispose();
        setVc(null);
      }
    };
    /*
    * Remember to only include things in your dependency array related to the state of your `VideoClient` instance, otherwise disposal may occur at undesired times.
    */
  }, [vc, token]);


  useEffect(() => {
    if (encoderUi === null) {
      (async () => {
        await mediaController.init();
        const mediaStreamController = await mediaController.requestController();
        setEncoderUi(new EncoderUiState(mediaStreamController));
      })();
    }

    return () => {
      if (encoderUi != null) {
        encoderUi.dispose();
        setEncoderUi(null);
      }
    };
  }, [encoderUi]);

  if (encoderUi === null || vc === null) { 
    return (
      <div>loading</div>
    )
  }

  return (
    <LivelyVideoClientContext.Provider value={vc}>
      <LivelyEncoderUiContext.Provider value={encoderUi}>
        <MediaContainer>
          <EncoderVideo />
        </MediaContainer>
      </LivelyEncoderUiContext.Provider>
    </LivelyVideoClientContext.Provider>
  );

  // return (
  //   <LivelyVideoClientContext.Provider value={vc}>
  //     <LivelyEncoderUiContext.Provider value={encoderUi}>
  //       <MediaContainer>
  //         <EncoderVideo />
  //         <ControlBar>
  //           <CameraButton />
  //           <MicrophoneButton />
  //           <JoinBroadcastButton setCallId={setCallId} broadcastOptions={{ streamName: "name" }} />
  //           {/* <ScreenCaptureButton /> */}
  //           <FullscreenButton />
  //           <SettingsButton />
  //         </ControlBar>

  //         <SettingsSidebar>
  //           <EncoderVideoDeviceSelect />
  //           <EncoderAudioDeviceSelect />
  //           {/* <EncoderResolutionSelect /> */}
  //           <EncoderNoiseSuppressionCheckbox />
  //           <EncoderEchoCancellationCheckbox />
  //           <TestMicButton />
  //         </SettingsSidebar>
  //       </MediaContainer>
  //     </LivelyEncoderUiContext.Provider>
  //   </LivelyVideoClientContext.Provider>
  // );
}

export default App;

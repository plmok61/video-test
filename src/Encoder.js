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

function Encoder({ setCallId }) {
  const [encoderUi, setEncoderUi] = useState(null);

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

  if (encoderUi === null) { 
    return (
      <div>loading</div>
    )
  }

  return (
    
      <LivelyEncoderUiContext.Provider value={encoderUi}>
        <MediaContainer style={{ width: '400px' }}>
          <EncoderVideo />
          <ControlBar>
            <CameraButton />
            <MicrophoneButton />
            <JoinBroadcastButton 
              setCallId={(id) => {
                console.log('CALL ID ', id);
                setCallId(id)
              }} 
              broadcastOptions={{ streamName: "demo" }} 
            />
            {/* <ScreenCaptureButton /> */}
            <FullscreenButton />
            <SettingsButton />
          </ControlBar>

          <SettingsSidebar>
            <EncoderVideoDeviceSelect />
            <EncoderAudioDeviceSelect />
            {/* <EncoderResolutionSelect /> */}
            <EncoderNoiseSuppressionCheckbox />
            <EncoderEchoCancellationCheckbox />
            <TestMicButton />
          </SettingsSidebar>
        </MediaContainer>
      </LivelyEncoderUiContext.Provider>
    
  );
}

export default Encoder;

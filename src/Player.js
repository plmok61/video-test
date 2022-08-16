
import {
  LivelyCallContext,
  LivelyPlayerUiContext,
  PlayerUiState,
  VideoClient,
  types,
  ControlBar,
  MediaContainer,
  PlayerAudioButton,
  PlayerBitrateButton,
  PlayerFullscreenButton,
  PlayerGetSoundButton,
  PlayerOverlayButton,
  PlayerPlayButton,
  PlayerVideo,
  PlayerVolumeRange,
} from "@livelyvideo/video-client-web";

function Player({ player }) {
  return (
    <div style={{width: "500px", margin: '30px auto', padding: '10px', textAlign: 'center', border: 'solid 1px black'}}>
      <LivelyPlayerUiContext.Provider value={player.uiState}>
        <MediaContainer>
          <PlayerGetSoundButton />
          <PlayerVideo />
          <ControlBar variant="player">
            <PlayerPlayButton />
            <PlayerAudioButton />
            <PlayerVolumeRange />
            <PlayerBitrateButton classNames="lv-push-left" />
            <PlayerFullscreenButton />
          </ControlBar>
          <PlayerOverlayButton />
        </MediaContainer>
      </LivelyPlayerUiContext.Provider>
    </div>
  );
}

export default Player;

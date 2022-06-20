import { useState, useEffect, useReducer } from 'react';
import {
  LivelyVideoClientContext,
  VideoClient,
  LivelyCallContext,
  PlayerUiState,
} from '@livelyvideo/video-client-web';
import { v4 as uuidv4 } from 'uuid';
import { useParams } from "react-router-dom";

import './App.css';
import { tokenRefresher } from './tokenRefresher';
import Encoder from './Encoder';
import Player from './Player';

// const endpoint = 'https://lively-dev-usc1a.livelyvideo.tv';
const endpoint = 'https://phil.devspace.lsea4.livelyvideo.tv';

const tokenOptions = {
  livelyEndpoint: endpoint,
  authUrl: `${endpoint}/api/demo/v1/access-token`,
  // authUrl: `${endpoint}/auth/v1/access-tokens`,
  // streamKey, // must be uuid - same as callId
  scope: "conference-participant",
  displayName: "demo-viewer",
  userId: "123",
  clientReferrer: "demo",
  // streamName: "demo",
}

const playerReducer = (players, action) => {
  switch (action.type) {
    case "addPlayer":
       return [...players, { id: '', uiState: new PlayerUiState(action.ev.player) }];
  case "removePlayer":
     return players.reduce((acc, player) => {
       if (player.playerUi.player === action.ev.player) {
         player.playerUi.dispose();
         return acc;
       }
       acc.push(player);
       return acc;
     }, []);
   case "unmount":
     return players.reduce((acc, player) => {
       player.playerUi.dispose();
       return acc;
     }, []);
    default:
      throw new Error();
 }
};

function Call({ isOwner }) {
  const [vc, setVc] = useState(null);
  const [call, setCall] = useState(null);
  const [_callId, setCallId] = useState(null);
  const [players, setPlayers] = useReducer(playerReducer, []);

  const { callId } = useParams()

  useEffect(() => {
    if (vc === null) {
      tokenOptions.streamKey = callId;
      if (isOwner) {
        tokenOptions.scope = 'conference-owner'
        tokenOptions.userId = '456';
        tokenOptions.displayName = 'demo-owner'
        tokenOptions.streamName = 'demo';
      }
      

      console.log('token options', tokenOptions);
      const opts = {
        livelyEndpoints:  [endpoint],
        token: tokenRefresher(tokenOptions),
        loggerConfig: {
          clientName: "video-text",
          writeLevel: "debug",
        },
      };

      const newVC = new VideoClient(opts);

      newVC.on("playerAdded", (ev) => {
        console.log('~~~~~~~PLAYER ADDED', ev)
        setPlayers({ type: "addPlayer", ev });
      });
  
      newVC.on("playerRemoved", (ev) => {
        setPlayers({ type: "removePlayer", ev });
      });
      setVc(newVC);
    }
    return () => {
      if (vc !== null) {
        setPlayers({ type: "unmount" });
        vc.removeAllListeners("playerAdded");
        vc.removeAllListeners("playerRemoved");
        vc.dispose();
        setVc(null);
      }
    };
  }, [vc, callId, isOwner]);

  if (vc === null) { 
    return (
      <div>loading</div>
    )
  }

  if (isOwner) {
    return (
      <LivelyVideoClientContext.Provider value={vc}>
        <LivelyCallContext.Provider value={call}>
          <div style={{ width: '500px' }}>
            <Encoder setCallId={setCallId} />
          </div>
          {players.map((player) => (
            player.uiState !== null && (
              <Player player={player} />
            )
          ))}
        </LivelyCallContext.Provider>
      </LivelyVideoClientContext.Provider>
    );
  }

  return (
    <LivelyVideoClientContext.Provider value={vc}>
      <LivelyCallContext.Provider value={call}>
        {players.map((player) => (
          player.uiState !== null && (
            <Player player={player} key={player.id} />
          )
        ))}
        <button 
          onClick={async () => {
            if (callId && vc && call === null) {
              const joinedCall = await vc.joinCall(callId, { userId: '123' });
              setCall(joinedCall);
            }
          }}
        >
          Join
        </button>
      </LivelyCallContext.Provider>
    </LivelyVideoClientContext.Provider>
  )
}

export default Call;

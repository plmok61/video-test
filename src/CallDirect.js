import { useState, useEffect, useReducer } from 'react';
import {
  LivelyVideoClientContext,
  VideoClient,
  LivelyCallContext,
  PlayerUiState,
} from '@livelyvideo/video-client-web';
import { useParams } from "react-router-dom";
import './App.css';
import Player from './Player';
import { endpoint } from './Env';

const userId = "test-" + Math.random() * 1000;

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

function CallDirect() {
  const [vc, setVc] = useState(null);
  const [call, setCall] = useState(null);
  const [players, setPlayers] = useReducer(playerReducer, []);

  const { callId } = useParams()

  useEffect(() => {
    if (vc === null) {
      const fetchToken = async (
        authUrl,
        reqBody
      ) => {
        const response = await fetch(authUrl, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqBody),
        });
        if (response.status !== 200) {
          throw new Error("Unable to get token: " + JSON.stringify(response));
        }

        const body = await response.json();
        return body.token;
      };

      const refreshToken = async () => {
        let token;
        try {
          console.log("fetching token...");
          token = await fetchToken(endpoint + "/api/demo/v1/access-token", {
            scopes: ["broadcaster"],
            userId: userId,
            data: {
              displayName: "Test User",
              mirrors: [
                {
                  id: userId,
                  streamName: userId,
                  kind: "rtmp",
                  rtmpPath: `/origin_proxy/${userId}`,
                  clientEncoder: "mobile",
                  streamKey: userId,
                },
              ],
            },
          });

          console.log("refreshed token");
        } catch (error) {
          console.error("unable to get access token", {
            error
          });
          throw error;
        }
        return token;
      };

      const opts = {
        livelyEndpoints: [endpoint],
        token: refreshToken,
        loggerConfig: {
          clientName: "video-test",
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
      // const join = async () => {
      //   const joinedCall = await newVC.joinCall(callId, { userId: userId });
      //   setCall(joinedCall);
      // };

      // join().then(() => {
      //   console.log("call joined");
      // });
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
  }, [vc, callId]);

  if (vc === null) {
    return (
      <h1 style={{ margin: "50px", textAlign: 'center' }}>loading</h1>
    )
  }

  if (call === null) {
    return (
      <div style={{ textAlign: 'center', margin: '20px auto', padding: '20px', width: '500px', border: "1px solid black" }}>
        <h1>Video Test</h1>
        <p>Click "watch" to view connected video feeds</p>
        <button
          style={{ padding: '20px' }}
          onClick={async () => {
            try {
              const joinedCall = await vc.joinCall(callId, { userId: userId });
              console.log("call joined");
              setCall(joinedCall);
            } catch (error) {
              alert("Connection failed. Link may be invalid");
            }
          }}
        >
          Watch
        </button>
      </div>
    )
  }


  if (players == null || players.length === 0) {
    return (
      <h1 style={{ margin: "50px", textAlign: 'center' }}>waiting</h1>
    )
  }

  return (
    <LivelyVideoClientContext.Provider value={vc}>
      <LivelyCallContext.Provider value={call}>
        {players.map((player) => (
          player.uiState !== null && (
            <Player player={player} key={player.id} />
          )
        ))}
      </LivelyCallContext.Provider>
    </LivelyVideoClientContext.Provider>
  )
}

export default CallDirect;

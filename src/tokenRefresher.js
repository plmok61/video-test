export const fetchToken = async (authUrl, fetchBody) => {
  const response = await fetch(authUrl, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fetchBody),
  });
  if (response.status !== 200) {
    throw new Error("Unable to get token");
  }

  const body = await response.json();
  return body.token;
};

export const tokenRefresher = (options) => {
  //Create our mirrors using the options that have been passed
  //Reminder: Mirrors are not needed for broadcasts that will not be transcoded.
  const mirrors = [
    {
      id: options.streamKey,
      streamName: options.streamName,
      kind: "rtmp",
      rtmpPath: `/origin_proxy/${options.streamKey}`,
      clientEncoder: "demo",
      streamKey: options.streamKey,
      clientReferrer: options.clientReferrer,
    },
  ];

  //This needs to be asynchronous because the fetchToken method will need to do a POST request to the authentication API
  return async () => {
    const url = `${options.authUrl}`;
    let token;
    try {
      const fetchOptions = {
        scopes: [options.scope],
        userId: options.userId,
        data: {
          displayName: options.displayName,
          //Remove if you do not need to transcode the broadcast
          mirrors,
        },
      };
      
      //This has not been created yet, please see below for this method.
      //Here we actually fetch our options
      token = await fetchToken(url, fetchOptions);
      console.log('token from refresher', token);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("unable to get access token", {
        error,
        url,
      });
      throw error;
    }

    return token;
  };
};
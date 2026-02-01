import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { client } from "../../api-client/client.gen";
import { getApiPrivate } from "../../api-client/sdk.gen";

function ProtectedApiTest() {
  const { getAccessTokenSilently } = useAuth0();
  const [apiResponse, setApiResponse] = useState(null);

  const callProtectedApi = async () => {
    try {
      const token = await getAccessTokenSilently();

      client.setConfig({
        baseUrl: "http://localhost:3010",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data } = await getApiPrivate();

      setApiResponse(data);
    } catch (error) {
      setApiResponse(error);
      console.error("API call failed:", error);
    }
  };

  return (
    <div>
      <button onClick={callProtectedApi}>Call API</button>
      {apiResponse && <pre>{JSON.stringify(apiResponse, null, 2)}</pre>}
    </div>
  );
}

export default ProtectedApiTest;

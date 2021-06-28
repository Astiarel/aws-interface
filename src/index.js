import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./css.css";
const listStyle = {
  listStyleType: "none",
};

function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)));
}

const InstanceManager = (props) => {
  const [region, setRegion] = useState("");
  const [key, setKey] = useState("");
  const [secret, setSecret] = useState("");
  const [instances, setInstances] = useState(null);
  const [apiStatus, setApiStatus] = useState("");
  const [logAttempt, setLogAttempt] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [jsonError, setJsonError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  //update les infos des instances qui permet de mettre a jour automatiquement la liste des instances, etats, etc
  const checkApiStatus = () => {
    //console.log("checkApi");
    fetch("http://localhost:8080/running")
      .then((response) => response.json())
      .then((jsonData) => {
        setApiStatus(jsonData.restapi);
      })
      .catch((error) => {
        // handle your errors here
        setError(error);
        setErrorMessage("Impossible d'acceder à l'API Rest");
        setApiStatus("");
      });
  };

  const updateInstancesData = () => {
    //console.log("updateInstancesData");
    if (isLoaded) {
      fetch(
        "http://localhost:8080/listid?region=" +
          utf8_to_b64(region) +
          "&key=" +
          utf8_to_b64(key) +
          "&secret=" +
          utf8_to_b64(secret) +
          ""
      )
        .then((response) => response.json())
        .then((jsonData) => {
          setInstances([...jsonData]);
        })
        .catch((error) => {
          // handle your errors here
          setError(error);
          setErrorMessage("Impossible d'acceder à l'API Rest");
        });
    }
  };

  //fonction une fois appelée commence a refresh le fetch. La page ne ce met a jour que lorsque le client est créé
  const startRefresh = () => {
    return setInterval(() => updateInstancesData(), 1000);
  };

  const startApiStatusRefresh = () => {
    return setInterval(() => checkApiStatus(), 1000);
  };

  const submit = (e) => {
    setLogAttempt(true);
    e.preventDefault();

    fetch("http://localhost:8080/running")
      .then((response) => response.json())
      .then((jsonData) => {
        setApiStatus(jsonData.restapi);
      })
      .catch((error) => {
        // handle your errors here
        setError(error);
        setErrorMessage("Impossible d'acceder à l'API Rest");
      });

    if (apiStatus === "running") {
      fetch(
        "http://localhost:8080/listid?region=" +
          utf8_to_b64(region) +
          "&key=" +
          utf8_to_b64(key) +
          "&secret=" +
          utf8_to_b64(secret) +
          ""
      )
        .then((response) => response.json())
        .then((jsonData) => {
          setIsLoaded(true);
          setInstances([...jsonData]);
          setJsonError(jsonData.error);
        })
        .catch((error) => {
          console.log("zeazeazeaze");
          // handle your errors here
          setError(error);
          setErrorMessage("Impossible d'acceder à l'API Rest");
        });
    } else {
      startApiStatusRefresh();
    }
  };

  const retour = () => {
    setIsLoaded(false);
  };

  useEffect(() => {
    const interval = startApiStatusRefresh();
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = startRefresh();
    return () => clearInterval(interval);
  }, [isLoaded]);

  if (jsonError) {
    return <div>Erreur : {jsonError.message}</div>;
  } else if (!isLoaded) {
    return (
      <>
        <div>Connectez-vous: </div> <br></br>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            required
            className="input"
          />
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            required
            className="input"
          />
          <button
            className="bouton"
            onClick={submit}
            disabled={!(apiStatus === "running") || logAttempt === true}
          >
            Se connecter
          </button>
        </form>
        <p hidden={apiStatus === "running"}>{errorMessage}</p>
      </>
    );
  } else {
    return (
      <>
        <ListeInstances
          listeInstance={instances}
          region={region}
          cle={key}
          secret={secret}
          apiStatus={apiStatus}
        />
        <button onClick={retour}>Retour</button>
        <p hidden={apiStatus === "running"}>
          L'API est hors ligne ou inaccessible
        </p>
      </>
    );
  }
};

const ListeInstances = (props) => {
  //le mot clé "key" ne peut pas etre utilisé avec les props (réservé), key->cle
  const start = (id, region, key, secret) => {
    fetch(
      "http://localhost:8080/manage?action=start&id=" +
        utf8_to_b64(id) +
        "&region=" +
        utf8_to_b64(region) +
        "&key=" +
        utf8_to_b64(key) +
        "&secret=" +
        utf8_to_b64(secret) +
        ""
    ).catch((error) => {
      // handle your errors here
      //console.error(error);
    });
  };

  const stop = (id, region, key, secret) => {
    fetch(
      "http://localhost:8080/manage?action=stop&id=" +
        utf8_to_b64(id) +
        "&region=" +
        utf8_to_b64(region) +
        "&key=" +
        utf8_to_b64(key) +
        "&secret=" +
        utf8_to_b64(secret) +
        ""
    ).catch((error) => {
      // handle your errors here
      //console.error(error);
    });
  };

  return (
    <>
      <ul>
        {props.listeInstance
          ? props.listeInstance.map((instance, index) => (
              <>
                <li key={index + "b"}>
                  {instance.instanceid} {instance.status}
                </li>
                <li style={listStyle} key={index + "a"}>
                  <button
                    key={index + "a"}
                    disabled={
                      !(instance.status === "stopped") ||
                      !(props.apiStatus === "running")
                    }
                    onClick={() =>
                      start(
                        instance.instanceid,
                        props.region,
                        props.cle,
                        props.secret
                      )
                    }
                  >
                    START
                  </button>
                  <button
                    key={index + "ab"}
                    disabled={
                      !(instance.status === "running") ||
                      !(props.apiStatus === "running")
                    }
                    onClick={() =>
                      stop(
                        instance.instanceid,
                        props.region,
                        props.cle,
                        props.secret
                      )
                    }
                  >
                    STOP
                  </button>
                </li>
              </>
            ))
          : ""}
      </ul>
    </>
  );
};
// ========================================

ReactDOM.render(<InstanceManager />, document.getElementById("root"));

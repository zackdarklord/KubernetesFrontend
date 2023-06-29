import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  const [namespaces, setNamespaces] = useState([]);
  const [releases, setReleases] = useState([]);
  const [selectedNamespace, setSelectedNamespace] = useState('');
  const [namespaceReleases, setNamespaceReleases] = useState([]);

  useEffect(() => {
    // Fetch namespaces
    axios.get('http://localhost:8082/api/kubernetes/namespaces')
      .then(response => {
        setNamespaces(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch namespaces:', error);
      });

    // Fetch releases
    axios.get('http://localhost:8082/api/kubernetes/releases')
      .then(response => {
        setReleases(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch releases:', error);
      });
  }, []);

  const getReleasesByNamespace = (namespace) => {
    axios.get(`http://localhost:8082/api/kubernetes/${namespace}`)
      .then(response => {
        setNamespaceReleases(response.data);
        setSelectedNamespace(namespace);
      })
      .catch(error => {
        console.error(`Failed to fetch releases for namespace ${namespace}:`, error);
      });
  };

  return (
    <div className="container">
      <h1>Namespaces</h1>
      <ul className="list-group zoom-effect">
        {namespaces.map(namespace => (
          <li key={namespace} className="list-group-item d-flex justify-content-between align-items-center zoom-effect">
            {namespace}
            <button className="btn btn-primary" onClick={() => getReleasesByNamespace(namespace)}>Get Releases</button>
          </li>
        ))}
      </ul>

      <h1>Releases</h1>
      {selectedNamespace && (
        <div className="namespace-releases zoom-effect">
          <h3>Releases for Namespace: {selectedNamespace}</h3>
          <ul className="list-group ">
            {namespaceReleases.map(release => (
              <li
                key={release}
                className={`list-group-item  ${release.includes('failed') ? 'text-danger' : 'text-success'}`}
              >
                {release}
              </li>
            ))}
          </ul>
        </div>
      )}

      <h1>All Releases</h1>
      <ul className="list-group">
        {releases.map(release => (
          <li
            key={release}
            className="list-group-item d-flex justify-content-between align-items-center zoom-effect"
          >
            {release}
            <button className="btn btn-primary" onClick={() => {}}>
              Restart
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;

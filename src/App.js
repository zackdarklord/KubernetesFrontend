import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { InfinitySpin } from 'react-loader-spinner'
;

const App = () => {
  const [namespaces, setNamespaces] = useState([]);
  const [releases, setReleases] = useState([]);
  const [selectedNamespace, setSelectedNamespace] = useState('');
  const [namespaceReleases, setNamespaceReleases] = useState([]);
  const [pods, setPods] = useState([]);
  const [deps, setDeps] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
      //fetch deps
      axios.get('http://localhost:8082/api/kubernetes/deployments')
      .then(response => {
        setDeps(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch deployments:', error);
      });
    // Fetch pods
    axios.get('http://localhost:8082/api/kubernetes/pods')
      .then(response => {
        setPods(response.data);
      })
      .catch(error => {
        console.error('Failed to fetch pods:', error);
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

  const restartDeployment = (namespace, deploymentName) => {
    setLoading(true); // Set loading to true when restarting deployment
    axios.post(`http://localhost:8082/api/kubernetes/${namespace}/${deploymentName}/restart`)
      .then(response => {
        console.log(response.data);
        // Refresh the releases for the current namespace
        getReleasesByNamespace(selectedNamespace);
   
      })
      .catch(error => {
        console.error(`Failed to restart deployment ${deploymentName} in namespace ${namespace}:`, error);
      })
      .finally(() => {
        setLoading(false); // Set loading to false after deployment is restarted
      });
  };
  if (loading) {
    return (
      <div className="loading-spinner">
           <InfinitySpin 
  width='200'
  color="#white"
/>
      </div>
    );
  }

  return (
    <div className="app-container">
   
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <div>
            <h1 className="blue-heading">Namespaces</h1>
            <ul className="list-group zoom-effect">
              {namespaces.map(namespace => (
                <li key={namespace} className="list-group-item d-flex justify-content-between align-items-center zoom-effect">
                  {namespace}
                  <button className="btn btn-primary" onClick={() => getReleasesByNamespace(namespace)}>Get Releases</button>
                </li>
              ))}
            </ul>
          </div>

          <h1 className="blue-heading">Releases</h1>
          {selectedNamespace && (
            <div className="namespace-releases zoom-effect">
              <h3>Releases for Namespace: {selectedNamespace}</h3>
              <ul className="list-group">
                {namespaceReleases.map(release => (
                  <li
                    key={release}
                    className={`list-group-item ${release.includes('failed') ? 'text-danger' : 'text-success'}`}
                  >
                    {release}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <h1 className="blue-heading">All Releases</h1>
          <ul className="list-group">
            {releases.map(release => (
              <li
                key={release}
                className="list-group-item d-flex justify-content-between align-items-center zoom-effect"
              >
                {release}
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-6">
          <h1 className="blue-heading">All Deployments</h1>
          <table className="table zoom-effect">
            <thead>
              <tr>
                <th>Deployment Name</th>
                <th>Namespace</th>
                <th>Progressing</th>
                <th>Available</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {deps.map(dep => (
                <tr key={dep.deploymentName}>
                  <td>{dep.deploymentName}</td>
                  <td>{dep.deploymentNamespace}</td>
                  <td>
                    {dep.state[0].status ? (
                      <span className="dot green-dot"></span>
                    ) : (
                      <span className="dot red-dot"></span>
                    )}
                  </td>
                  <td>
                    {dep.state[1].status ? (
                      <span className="dot green-dot"></span>
                    ) : (
                      <span className="dot red-dot"></span>
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => restartDeployment(dep.deploymentNamespace, dep.deploymentName)}
                    >
                      Restart the Deployment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h1 className="blue-heading">All Pods</h1>
          <table className="table zoom-effect">
            <thead>
              <tr>
                <th>Pod Name</th>
                <th>Namespace</th>
                <th>Initialized</th>
                <th>Ready</th>
                <th>ContainersReady</th>
                <th>PodScheduled</th>
              </tr>
            </thead>
            <tbody>
              {pods.map(pod => (
                <tr key={pod.podName}>
                  <td>{pod.podName}</td>
                  <td>{pod.namespace}</td>
                  <td>
                    {pod.state[0].status ? (
                      <span className="dot green-dot"></span>
                    ) : (
                      <span className="dot red-dot"></span>
                    )}
                  </td>
                  <td>
                    {pod.state[1].status ? (
                      <span className="dot green-dot"></span>
                    ) : (
                      <span className="dot red-dot"></span>
                    )}
                  </td>
                  <td>
                    {pod.state[2].status ? (
                      <span className="dot green-dot"></span>
                    ) : (
                      <span className="dot red-dot"></span>
                    )}
                  </td>
                  <td>
                    {pod.state[3].status ? (
                      <span className="dot green-dot"></span>
                    ) : (
                      <span className="dot red-dot"></span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  );
};

export default App;

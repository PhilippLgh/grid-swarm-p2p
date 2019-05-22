import React, { Component } from 'react'
import './App.css'
import Dropzone from 'react-dropzone'
import axios from 'axios'

class App extends Component {
  state = {
    files: [],
    ready: false
  }
  componentDidMount = async () => {
    const swarm = await window.grid.getClient('swarm')
    const state = swarm.getState()
    if(state==='STARTED'){
      this.setState({
        ready: true
      })
      return
    }
    console.log('swarm state', swarm.getState())
    swarm.on('started', async () => {
      // use RPC methods here
      this.setState({
        ready: true
      })

    })
  }
  onDrop = async acceptedFiles => {
    const { files } = this.state

    let uploads = acceptedFiles.map(f => {
      return axios.post('http://localhost:8500/bzz:/', f)
      .then(result => {
        return {
          name: f.name,
          size: f.size,
          swarmHash: result.data
        }
      })
      .catch(err => console.log('error during upload', err))
    })

    let uploadedFiles = await Promise.all(uploads)

    this.setState({files: [...files, ...uploadedFiles]})
  }
  renderFileList(){
    const { files } = this.state
    return (
      files.map(file => (
        <li key={file.name}>
          {file.name} - {file.size} bytes - {file.swarmHash}
        </li>
      ))
    )
  }
  render(){
    const { ready } = this.state
    return (
      <div className="App">
        <h1>Swarm P2P Sharing</h1>
        <h2>State: {ready ? 'ready' : 'waiting for Swarm'}</h2>
        <Dropzone onDrop={this.onDrop}>
          {({getRootProps, getInputProps}) => (
            <section className="dropzone">
              <div {...getRootProps()}>
                <input {...getInputProps()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
            </section>
          )}
        </Dropzone>
        {this.renderFileList()}
      </div>
    )
  }
}

export default App

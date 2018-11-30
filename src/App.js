import React, { Component } from 'react';
import JeopardyData from './jeopardyData';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          Jeopardy
        </header>
        <JeopardyData />
      </div>
    );
  }
}

export default App;

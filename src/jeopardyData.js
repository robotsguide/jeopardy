import React, { Component } from 'react';
import './App.css';

class JeopardyData extends Component {
  constructor() {
    super();
    const catIds = [];

    while (catIds.length < 5) {
      const catNumber = Math.floor(Math.random() * 10000);
      if (!catIds.includes(catNumber)) {
        catIds.push(catNumber);
      }
    }

    this.state = {
      catIds: catIds,
      categories: [],
      clues: [],
    };
  }

  componentWillMount() {
    Promise.all([
      fetch(`http://jservice.io/api/category?id=${this.state.catIds[0]}`),
      fetch(`http://jservice.io/api/category?id=${this.state.catIds[1]}`),
      fetch(`http://jservice.io/api/category?id=${this.state.catIds[2]}`),
      fetch(`http://jservice.io/api/category?id=${this.state.catIds[3]}`),
      fetch(`http://jservice.io/api/category?id=${this.state.catIds[4]}`)
    ]).then(responses => {
        Promise.all(responses.map(data => data.json()))
        .then(results => {
          let categories = results.map(cat => {
            let clues = cat.clues;
            if (clues.length > 5) {
              clues.splice(5);
            }
            clues.sort((a,b) => a.value - b.value);

            let i = 100;
            clues.forEach(clue => {
              clue.value = i;
              i += 100;
            });

            let catClues = clues.map(clue => {
              return(
                <div className="clue" key={clue.id}>{clue.value}</div>
              )
            });
            return(
              <div className="column" key={cat.id}>
                <div className="category-title">{cat.title}</div>
                {catClues}
              </div>
            )
          })
          this.setState({categories: categories});
        });
    });
  }

  render() {
    return (
      <div className="game-board">
        {this.state.categories}
      </div>
    )
  }
}

export default JeopardyData;

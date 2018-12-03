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

    this.changeCurrentAnswer = this.changeCurrentAnswer.bind(this);

    this.state = {
      catIds: catIds,
      categories: [],
      currentQuestion: null,
      currentAnswer: undefined,
      currentQuestionValue: null,
      correctAnswer: null,
      answerIsCorrect: null,
      answerResult: null,
      currentScore: 0,
      totalQuestionsAnswered: 0,
    };
  }

  loadQuestion(clue) {

    let answer = this.state.currentAnswer,
        rawData = this.state.rawData

    rawData.forEach(cat => {
      cat.clues.forEach(item => {
        if (clue.question === item.question) {
          let totalQsAnswered = (this.state.totalQuestionsAnswered);
          item.alreadyClicked = true;
          this.setState({
            totalQuestionsAnswered: (totalQsAnswered +=1),
          })
        }
      })
    })

    let question = (
      <div className="question-modal">
        <div className="question">
          <p>{clue.question}</p>
          <input type="text" value={answer} placeholder="your answer" onChange={this.changeCurrentAnswer} />
          <button onClick={() => this.submitAnswer(answer)}>submit answer</button>
        </div>
      </div>
    )
    if (!this.state.currentQuestion) {
      this.setState({
        currentQuestion: question,
        correctAnswer: clue.answer,
        currentQuestionValue: clue.value,
      });
      this.setCategoriesAndClues(rawData);
    }
  }

  changeCurrentAnswer(value) {
    this.setState({currentAnswer: value.target.value});
  }

  submitAnswer() {
    let answer = this.state.currentAnswer || '',
        currentQuestionValue = 0,
        score = this.state.currentScore;

    const correctAnswer = this.state.correctAnswer.replace(/<\/?[^>]+(>|$)/g, '').toLowerCase(),
          currentAnswer = answer.toLowerCase();
    let answerResult = (
      <div className="answer-modal">
        <div className="answer-result">
          <p>Incorrect! the correct answer was {correctAnswer}.</p>
          <button onClick={() => this.closeAnswerDialog()}>Close</button>
        </div>
      </div>
    )

    if (currentAnswer === correctAnswer) {
      currentQuestionValue = this.state.currentQuestionValue;
      let newScore = (score += currentQuestionValue);
      answerResult = (
        <div className="answer-modal">
          <div className="answer-result">
            <p>Correct! Your Score is now {newScore}.</p>
            <button onClick={() => this.closeAnswerDialog()}>Close</button>
          </div>
        </div>
      )
    }

    this.clearQuestionData();

    this.setState({
      answerResult: answerResult,
      currentScore: score,
    });
  }

  clearQuestionData() {
    this.setState({
      currentQuestion: null,
      currentAnswer: undefined,
    })
  }

  closeAnswerDialog() {
    this.setState({
      answerResult: null,
    })
    if (this.state.totalQuestionsAnswered >= 25) {
      this.showGameResults();
    }
  }

  showGameResults() {
    let score = this.state.currentScore;
    let gameResults= (
      <div className="answer-modal">
        <div className="answer-result">
          <p>Game Over! Your final score is {score}.</p>
          <button onClick={() => this.resetGame()}>Play Again</button>
        </div>
      </div>
    )

    this.setState({gameResults: gameResults});
  }

  resetGame() {
    window.location.reload();
  }

  setCategoriesAndClues(results) {
    let categories = results.map(cat => {
      let clues = cat.clues;

      clues.forEach(clue => {
        if (!clue.question) {
          clues.pop(clue);
        }
      })

      if (clues.length > 5) {
        clues.splice(5);
      }

      if (clues.length < 5) {
        this.resetGame();
      }
      clues.sort((a,b) => a.value - b.value);

      let i = 100;
      clues.forEach(clue => {

        clue.value = i;
        i += 100;

      });

      let catClues = clues.map(clue => {
        if (clue.alreadyClicked) {
          return(
            <div className="clue" key={clue.id} ></div>
          )
        } else {
          return(
            <div className="clue" key={clue.id} onClick={() => this.loadQuestion(clue)}>{clue.value}</div>
          )
        }
      });
      return(
        <div className="column" key={cat.id}>
          <div className="category-title">{cat.title}</div>
          {catClues}
        </div>
      )
    })
    let endGameButton = (
      <button onClick={() => this.showGameResults()}>End Game</button>
    )
    let reloadCategoriesButton = (
      <button onClick={() => this.resetGame()}>Reload Categories</button>
    )
    this.setState({
      categories: categories,
      endGameButton: endGameButton,
      reloadCategoriesButton: reloadCategoriesButton
    });
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
          this.setState({rawData: results});
          this.setCategoriesAndClues(results);
        });
    });
  }


  render() {
    return (
      <div className="main-section">
        <div className="game-board">
          {this.state.categories}
        </div>
        {this.state.currentQuestion}
        {this.state.answerResult}
        {this.state.gameResults}
        <div className="score-container">
          Your Score: {this.state.currentScore}<br />
        {this.state.endGameButton} {this.state.reloadCategoriesButton}
        </div>
      </div>
    )
  }
}

export default JeopardyData;

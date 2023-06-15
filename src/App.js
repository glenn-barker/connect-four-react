import { useState } from 'react';
import './App.css';

/**
 * <Square/> renders a single grid square within the board.
 * @param {*} param0 
 * @returns 
 */
function Square({value, onSquareClick}) {
  return (
    <button className={`square square-${value}`} onClick={onSquareClick}>
      {value}
    </button>
  );
}

/**
 * <Board/> renders the entire game board grid.
 * @param {*} param0 
 * @returns 
 */
function Board({grid, onPlay}) {
  return (
    <div className='board'>
      {grid.map((row, rowIndex) => {
        return (
          <div key={`row-${rowIndex}`} className='board-row'>
            {row.map((square, columnIndex) => {
              return (
                <Square
                  key={`square-${columnIndex + rowIndex*row.length}`}
                  value={square}
                  onSquareClick={() => onPlay(columnIndex)}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * <App/> is the root element that renders the entire game and keeps track of all state info.
 * @returns 
 */
function App() {
  const [grid, setGrid] = useState(generateEmptyGrid(7, 6));  // Default 7x6 empty board.
  const [currentMove, setCurrentMove] = useState(0);
  const nextTurn = (currentMove % 2 === 0 ? 'R' : 'B');

  function handlePlay(columnIndex) {
    // Given a column, determine where the next piece would land after.
    const rowIndex = getNextRowIndexInColumn(grid, columnIndex);
    if (rowIndex < 0) return;  // Don't overfill columns.
    
    // Add the piece to the bottom of the chosen column.
    const newGrid = grid.slice();
    newGrid[rowIndex][columnIndex] = nextTurn;

    // Update state & re-render, updating the current move also swaps players.
    setGrid(newGrid);
    setCurrentMove(currentMove + 1);
  }

  return (
    <Board grid={grid} onPlay={handlePlay}/>
  );
}

/**
 * Create & return an empty 2D array.
 * @param {*} width 
 * @param {*} height 
 * @returns 
 */
function generateEmptyGrid(width, height) {
  return Array(height).fill().map(() => Array(width).fill(null));
}

/**
 * Return a single vertical column within the 2D board.
 * @param {*} grid The 2D array making up the board grid.
 * @param {*} columnIndex Which column?
 * @returns An array of squares making up the requested column.
 */
function getColumn(grid, columnIndex) {
  return grid.slice().map(row => row[columnIndex]);
}

/**
 * Return the row index of the lowest unfilled square within the grid.
 * I.e. cause pieces to "fall" to the bottom of the board when placed.
 * @param {*} grid The 2D array making up the board grid.
 * @param {*} columnIndex Which column?
 * @returns The index of where the next piece would land if it were
 *          to be placed in this column. If the column is full, this
 *          will return -1.
 */
function getNextRowIndexInColumn(grid, columnIndex) {
  const column = getColumn(grid, columnIndex);
  return column.length - column.filter(square => !!square).length - 1;
}

export default App;

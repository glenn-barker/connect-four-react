import { useState } from 'react';
import './App.css';

/**
 * <Player/> renders a color-coded player name, like "Red" or "Yellow".
 * @param {*} param0 
 * @returns 
 */
function Player({player}) {
  return (
    <span className={`player-${player}`}>
      {
        {
          R: 'Red',
          Y: 'Yellow',
          B: 'Black'
        }[player]
      }
    </span>
  );
}

/**
 * <Square/> renders a single grid square within the board.
 * @param {*} param0 
 * @returns 
 */
function Square({value, onSquareClick}) {
  return (
    <span className='square-parent' onClick={onSquareClick}>
      <button className={`square square-${value}`} />
    </span>
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
  const [history, setHistory] = useState([generateEmptyGrid(7, 6)]);  // Default 7x6 empty board.  
  const [currentMove, setCurrentMove] = useState(0);                  // Keep track of how many turns have passed.
  const currentPlayer = (currentMove % 2 === 0 ? 'R' : 'Y');          // Alternate red/yellow player every turn.
  
  const grid = history[currentMove];
  const winner = calculateWinner(grid);
  const status = (winner ? 'Winner:' : 'Next player:');
  const player = (winner ? <Player player={winner}/> : <Player player={currentPlayer}/>);

  /**
   * This method handles placing pieces & updating board state when a player clicks in the board.
   * @param {*} columnIndex 
   * @returns 
   */
  function handlePlay(columnIndex) {
    // Given a column, determine where the next piece would land after being dropped.
    const rowIndex = getNextRowIndexInColumn(grid, columnIndex);
    if (rowIndex < 0 || winner) return;  // Don't overfill columns or play when the game is over.
    
    // Add the piece to the bottom of the chosen column.
    const newGrid = grid.map(i => i.slice());  // Copy the entire 2D grid before modifying.
    newGrid[rowIndex][columnIndex] = currentPlayer;

    // Append the new board state to the game's history.
    const newHistory = [...history.slice(0, currentMove + 1), newGrid];

    // Update state & re-render, updating the current move also swaps players.
    setHistory(newHistory);
    setCurrentMove(newHistory.length - 1);
  }

  /**
   * This method handles updating board state to reflect history when a player clicks Undo or Redo.
   * @param {*} direction 
   */
  function jumpToHistory(historyIndex) {
    setCurrentMove(historyIndex);
  }

  /**
   * This function resets all state data, effectively resetting the game.
   */
  function newGame() {
    setHistory([history[0]]);
    setCurrentMove(0);
  }

  return (
    <>
      <Board grid={grid} onPlay={handlePlay}/>
      <div className='game-info'>{status} {player}</div>
      <div className='game-info'>
        <button onClick={() => jumpToHistory(currentMove - 1)} disabled={currentMove === 0}>Undo</button>
        <button onClick={() => jumpToHistory(currentMove + 1)} disabled={currentMove+1 >= history.length}>Redo</button>
        <button onClick={newGame}>Restart</button>
      </div>
    </>
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
 * Return the row index of the lowest unfilled square within the grid.
 * I.e. cause pieces to "fall" to the bottom of the board when placed.
 * @param {*} grid The 2D array making up the board grid.
 * @param {*} columnIndex Which column?
 * @returns The index of where the next piece would land if it were
 *          to be placed in this column. If the column is full, this
 *          will return -1.
 */
function getNextRowIndexInColumn(grid, columnIndex) {
  const column = grid.slice().map(row => row[columnIndex]);
  return column.length - column.filter(square => !!square).length - 1;
}

/**
 * Check for a win condition within the game board grid.
 * @param {*} grid The 2D array making up the board grid.
 * @param {*} desiredLength The length of the "line" to search for & return. Defaults to 4.
 * @returns A player that has achieved a win condition, null otherwise.
 */
function calculateWinner(grid, desiredLength = 4) {
  // Helper functions to pull various 1D line segments from the 2D grid...
  function getHorizontalLineSegment(rowIndex, columnIndex) {
    if (columnIndex > grid[rowIndex].length - desiredLength) return [];
    return Array(desiredLength).fill().map((_, i) => grid[rowIndex][columnIndex+i]);
  }
  function getVerticalLineSegment(rowIndex, columnIndex) {
    if (rowIndex > grid.length - desiredLength) return [];
    return Array(desiredLength).fill().map((_, i) => grid[rowIndex+i][columnIndex]);
  }
  function getPrimaryDiagonalLineSegment(rowIndex, columnIndex) {
    if (columnIndex > grid[rowIndex].length - desiredLength) return [];
    if (rowIndex > grid.length - desiredLength) return [];
    return Array(desiredLength).fill().map((_, i) => grid[rowIndex+i][columnIndex+i]);
  }
  function getSecondaryDiagonalLineSegment(rowIndex, columnIndex) {
    if (columnIndex > grid[rowIndex].length - desiredLength) return [];
    if (rowIndex < desiredLength) return [];
    return Array(desiredLength).fill().map((_, i) => grid[rowIndex-i][columnIndex+i]);
  }
  // Helper function to determine whether a single player has fully filled an arbitrary 1D line segment.
  function isLineSegmentValid(line) {
    if (!line || !line.length) return false;
    return line.every(square => square === line[0] && !!line[0]);
  }

  // Iterate over the grid.
  for (let rowIndex=0; rowIndex<grid.length; rowIndex++) {
    for (let columnIndex=0; columnIndex<grid[rowIndex].length; columnIndex++) {
      // At any given grid square, there are 4 possible line segments that can result in a victory.
      const potentialLines =
        [
          getHorizontalLineSegment(rowIndex, columnIndex),
          getVerticalLineSegment(rowIndex, columnIndex),
          getPrimaryDiagonalLineSegment(rowIndex, columnIndex),
          getSecondaryDiagonalLineSegment(rowIndex, columnIndex)
        ];
      // If any of the 4 possible line segments are valid, the player who made the line achieved a win condition.
      if (potentialLines.filter(isLineSegmentValid).length) return grid[rowIndex][columnIndex];
    }
  }
  // No players have achieved a win condition.
  return null;
}

export default App;

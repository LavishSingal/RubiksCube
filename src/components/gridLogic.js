export function applyShiftToGrid(grid, face, faceSign, direction) {
  // Helper to get values from a row using given columns
  let { rowOrder, colIndices } = shiftMap[JSON.stringify([face, faceSign])];
  if(direction === -1){
    rowOrder = [...rowOrder].reverse();
    colIndices = [...colIndices].reverse();
  }
  const getCols = (row, cols) =>
    cols.map(col => grid[row - 1][col - 1]);

  // Helper to set values into a row at specific columns
  const setCols = (row, cols, values) => {
    cols.forEach((col, idx) => {
      grid[row - 1][col - 1] = values[idx];
    });
  };

  // Save the values of the first row to rotate later
  const temp = getCols(rowOrder[0], colIndices[0]);

  // Perform the 3 shifts
  for (let i = 0; i < rowOrder.length - 1; i++) {
    const fromRow = rowOrder[i + 1];
    const fromCols = colIndices[i + 1];
    const toRow = rowOrder[i];
    const toCols = colIndices[i];
    const values = getCols(fromRow, fromCols);
    setCols(toRow, toCols, values);
  }

  // Final: set last → first
  setCols(rowOrder[rowOrder.length - 1], colIndices[rowOrder.length - 1], temp);
  if (faceSign !== 0){
    let row = -1;
    const reverse = (faceSign * direction) === 1;
    if(face === 'y'){
        if(faceSign === 1) row = 1;
        else if(faceSign === -1) row = 4;
    }
    else if(face === 'x'){
        if(faceSign === 1) row = 5;
        else if(faceSign === -1) row = 2;
    }
    else if(face === 'z'){
        if(faceSign === 1) row = 3;
        else if(faceSign === -1) row = 6;
    }
    if(row !== -1){
      const rotatedRow = rotateRowAsGridClockwise(grid[row - 1], reverse);
      grid[row - 1] = rotatedRow;
    }
  }

}

function rotateRowAsGridClockwise(row, reverse = false) {
  if (row.length !== 9) {
    throw new Error("Row must have exactly 9 elements for 3x3 rotation.");
  }

  // Treat row as a 3x3 matrix
  const grid = [
    row.slice(0, 3),
    row.slice(3, 6),
    row.slice(6, 9),
  ];

  // Rotate once clockwise
  const rotateOnce = (g) => [
    [g[2][0], g[1][0], g[0][0]],
    [g[2][1], g[1][1], g[0][1]],
    [g[2][2], g[1][2], g[0][2]],
  ];

  // Rotate either 1 time or 3 times (to reverse)
  let rotatedGrid = grid;
  const times = reverse ? 3 : 1;
  for (let i = 0; i < times; i++) {
    rotatedGrid = rotateOnce(rotatedGrid);
  }

  // Flatten back to 1D array
  return rotatedGrid.flat();
}

const shiftMap = {
  [JSON.stringify(['y', 1])]: {
    rowOrder: [3, 2, 6, 5],
    colIndices: [
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3],
        [1, 2, 3]
    ],
  },[JSON.stringify(['y', 0])]: {
    rowOrder: [3, 2, 6, 5],
    colIndices: [
        [4, 5, 6],
        [4, 5, 6],
        [4, 5, 6],
        [4, 5, 6]
    ],
  },[JSON.stringify(['y', -1])]: {
    rowOrder: [3, 2, 6, 5],
    colIndices: [
        [7, 8, 9],
        [7, 8, 9],
        [7, 8, 9],
        [7, 8, 9]
    ],
  },[JSON.stringify(['x', 1])]: {
    rowOrder: [3, 1, 6, 4],
    colIndices: [
        [3, 6, 9],
        [3, 6, 9],
        [7, 4, 1],
        [3, 6, 9]
    ],
  },[JSON.stringify(['x', 0])]: {
    rowOrder: [3, 1, 6, 4],
    colIndices: [
        [2, 5, 8],
        [2, 5, 8],
        [8, 5, 2],
        [2, 5, 8]
    ],
  },[JSON.stringify(['x', -1])]: {
    rowOrder: [3, 1, 6, 4],
    colIndices: [
        [1, 4, 7],
        [1, 4, 7],
        [9, 6, 3],
        [1, 4, 7]
    ],
  },[JSON.stringify(['z', 1])]: {
    rowOrder: [5, 4, 2, 1],
    colIndices: [
        [7, 4, 1],
        [1, 2, 3],
        [3, 6, 9],
        [9, 8, 7]
    ],
  },[JSON.stringify(['z', 0])]: {
    rowOrder: [5, 4, 2, 1],
    colIndices: [
        [8, 5, 2],
        [4, 5, 6],
        [2, 5, 8],
        [6, 5, 4]
    ],
  },[JSON.stringify(['z', -1])]: {
    rowOrder: [5, 4, 2, 1],
    colIndices: [
        [9, 6, 3],
        [7, 8, 9],
        [1, 4, 7],
        [3, 2, 1]
    ],
  },
};
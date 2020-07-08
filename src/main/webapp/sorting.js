function clickfunc(columnIndex, tableName) {
  console.log("sorting " + columnIndex + " table " + tableName);

  const table = document.getElementById(tableName);
  // const allRows = table.rows;
  // console.log(Array.isArray(table.rows))
  // var rows = allRows.slice(1, allRows.length);
  // const newOrder = sort(rows, columnIndex);
  // for (index in rows) {
  //   allRows[index + 1].remove();
  //   allRows[index].parentNode.insertAfter(allRows[index], newOrder[index]);
  // }

  let direction = "ascending";
  let sorting = true;
  let countSwitches = 0;

  while (sorting) {
    const rows = table.rows;
    sorting = false;
    let shouldSwitch = false;

    let index;
    for (index = 1; index < rows.length - 1; index++) {
      const data1 = rows[index].getElementsByTagName("td")[columnIndex];
      const data2 = rows[index + 1].getElementsByTagName("td")[columnIndex];

      if (direction == "ascending" && data1.innerHTML > data2.innerHTML) {
        shouldSwitch = true;
        break;
      } else if (direction == "descending" && data1.innerHTML < data2.innerHTML) {
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      rows[index].parentNode.insertBefore(rows[index + 1], rows[index]);
      sorting = true;
      countSwitches++;
    } else if (countSwitches == 0 && direction == "ascending") {
      direction = "descending";
      sorting = true;
    }
  }
}

// function sort(rows, colIndex) {
//   if (rows.length <= 1) {
//     return rows;
//   }

//   const middle = Math.floor(rows.length / 2);
//   const left = rows.slice(0, middle);
//   const right = rows.slice(middle);

//   return merge(sort(left, colIndex), sort(right, colIndex), colIndex);
// }

// function merge(left, right, colIndex) {
//   let result = [];
//   let leftIndex = 0;
//   let rightIndex = 0;

//   while (leftIndex < left.length && rightIndex < right.length) {
//     const leftData = left[leftIndex].getElementsByTagName("td")[colIndex].innerHTML;
//     const rightData = right[rightIndex].getElementsByTagName("td")[colIndex].innerHTML;
//     if (leftData < rightData) {
//       result.push(leftData);
//       leftIndex++;
//     } else {
//       result.push(rightData);
//       rightIndex++;
//     }
//   }

//   result.concat(left.slice(leftIndex));
//   result.concat(right.slice(rightIndex));
//   return result;
// }

function sort(columnIndex, tableName) {
  const queryString = '/data-from-db' + window.location.search;
  const table = document.getElementById(tableName);
  const columnHeaders = table.rows[0];
  const columnName = columnHeaders.getElementsByTagName("th")[columnIndex].innerHTML;

  fetch(queryString)
  .then(response => response.json())
  .then((data) => { 
    let tableIndex = 0;
    for (tableIndex in data) {
      const tableData = data[tableIndex];
      const name = tableData.name;
      if (name == tableName) {
        const schemas = tableData.schemas;
        const columnSchema = findColumnSchema(schemas, columnName);
        doSort(columnSchema, columnIndex, table)
      }
    }
  });
}

function findColumnSchema(schemas, columnName) {
  let index = 0;
  for (index in schemas) {
    const schema = schemas[index];
    if (schema.columnName == columnName) {
      return schema.schemaType;
    }
  }
}

function doSort(columnSchema, columnIndex, table) {
  let direction = "ascending";
  let sorting = true;
  let countSwitches = 0;

  while (sorting) {
    const rows = table.rows;
    sorting = false;
    let shouldSwitch = false;

    let index;
    for (index = 2; index < rows.length - 1; index++) {
      const data1 = rows[index].getElementsByTagName("td")[columnIndex];
      const data2 = rows[index + 1].getElementsByTagName("td")[columnIndex];

      var innerHTML1 = data1.innerHTML;
      var innerHTML2 = data2.innerHTML;

      const int1 = parseInt(innerHTML1);
      const int2 = parseInt(innerHTML2);

      if (Number.isInteger(int1) && Number.isInteger(int2)) { // Integers
        if (direction == "ascending" && int1 > int2) {
          shouldSwitch = true;
          break;
        } else if (direction == "descending" && int2 > int1) {
          shouldSwitch = true;
          break;
        }
      } else { // String
        if (innerHTML1 == "NULL") {
          innerHTML1 = "";
        }
        if (innerHTML2 == "NULL") {
          innerHTML2 = "";
        }
        if (direction == "ascending" && innerHTML1 > innerHTML2) {
          shouldSwitch = true;
          break;
        } else if (direction == "descending" && innerHTML1 < innerHTML2) {
          shouldSwitch = true;
          break;
        }
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

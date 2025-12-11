export { compareSysexArray };

// ##############################################
function compareSysexArray(module, inputData) {
  const format = 'background-color: purple;color: white';
  console.log('%c compareSysexArray', format, inputData?.length);
  if (Array.isArray(inputData) && inputData?.length == 383) module.sysexCompareArray = [...inputData];
  if (!module.sysexCompareArray) return;
  if (Object.hasOwn(inputData, 1)) compareModuleValuesWithSysexCompareArray(module, inputData);
}
// ####################################################
function compareModuleValuesWithSysexCompareArray(module, dataObj) {
  console.log('initInstrumentValuesFromModuleValues');
  for (const page in dataObj) {
    const valuesObj = dataObj[page];
    const tablePageObj = module.tablePageMap.get(Number(page));
    for (const paramName in valuesObj) {
      if (skipParameter(page, paramName)) continue;
      const tableInstrObj = module.table[tablePageObj[paramName].target];
      if (module.sysexCompareArray[tableInstrObj.id] != valuesObj[paramName]) {
        const format = 'background-color: purple;color: white;font;font-size: x-large;';
        const msg = 'error';
        logThis(module, msg, format, tableInstrObj, tablePageObj, paramName, valuesObj, page);
      } else {
        const format = 'background-color: lightgrey;color: purple;font;font-size: x-large;';
        const msg = 'identisch';
        logThis(module, msg, format, tableInstrObj, tablePageObj, paramName, valuesObj, page);
      }
    }
  }
}

function skipParameter(page, paramName) {
  const skipArray = [
    [5, 'Select_8'],
    [8, 'Select_2'],
    [9, 'Select_2'],
    [10, 'Select_2'],
    [11, 'Select_2'],
  ];
  for (let i = 0; i < skipArray.length; i++) {
    const paramArray = skipArray[i];
    if (paramArray[0] == page && paramArray[1] == paramName) return true;
  }
  return false;
}

function logThis(module, msg, format, tableInstrObj, tablePageObj, paramName, valuesObj, page) {
  console.log(
    '%c ' + msg + ' ->',
    format,
    module.name,
    '  page:',
    page,
    ' id:',
    tableInstrObj.id,
    ' ->',
    tableInstrObj.name,
    ' -> value:',
    valuesObj[paramName],
    ' paramName: ',
    paramName,
    ' tablePageMap:',
    JSON.parse(JSON.stringify(tablePageObj[paramName]))
  );
}

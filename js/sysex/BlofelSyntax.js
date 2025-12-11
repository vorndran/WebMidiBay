export {
  sysexFileHead,
  sysexFileTail,
  soundDataHead,
  soundCategories,
  blofelDumpRequest,
  minilogueDumpRequest,
  microfreakDumpRequest,
  getBlofeldPatchName,
  getBlofeldPatchCategory,
};
// ##########################################################
// Blofeld ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const sysexFileHead = [
  77, 84, 104, 100, 0, 0, 0, 6, 0, 0, 0, 1, 0, 96, 77, 84, 114, 107, 0, 0, 1, 143, 16, 240, 131, 7,
];
const sysexFileTail = [0, 255, 47, 0];
const soundDataHead = [240, 62, 19, 0, 16, 127, 0];
const soundCategories = [
  'Init',
  'Arp',
  'Atmo',
  'Bass',
  'Drum',
  'FX',
  'Keys',
  'Lead',
  'Mono',
  'Pad',
  'Perc',
  'Poly',
  'Seq',
];
const blofelDumpRequest = [240, 62, 19, 0, 0, 127, 0, 127, 247];
// Minilogue ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const minilogueDumpRequest = [240, 66, 63, 0, 1, 81, 16, 247];
// const minilogueDumpRequest = ['$xF0', '$x42', '$x3F', '$x00', '$x01', '$x51', '$x10', '$xF7',];
// MicroFreak ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// const microfreakDumpRequest = [
//   '$xF0',
//   '$x00',
//   '$x20',
//   '$x6B',
//   '$x07',
//   '$x01',
//   '$x31',
//   '$x03',
//   '$x19',
//   '$x00',
//   '$x02',
//   '$x00',
//   '$xF7',
// ];
//                              F0  00  20  6B  07  01  1D  03  19  00  03  00  F7
// const microfreakDumpRequest = [240, 0, 32, 107, 7, 1, 29, 3, 23, 0, 3, 0, 247];

// const microfreakDumpRequest = [240, 0, 32, 107, 7, 1, 49, 3, 23, 0, 1, 0, 247];
//                               F0 00 20 6B 07 01 00 01 19 00 00 00 F7
//                               F0 00 20 6B 07 01 00 01 19 00 01 00 F7
//                               F0 00 20 6B 07 01 00 01 19 00 02 00 F7
const microfreakDumpRequest = [240, 0, 32, 107, 7, 1, 0, 1, 23, 0, 0, 0, 247];
// const microfreakDumpRequest = [240, 0, 32, 107, 7, 1, 50, 1, 24, 0, 247];
// ##############################################################
function getBlofeldPatchName(sysexData) {
  //console.log(`get Blofeld Patch Name "${String.fromCharCode(...sysexData.slice(370, 386)).replaceAll(' ', '_')}"`);
  return String.fromCharCode(...sysexData.slice(370, 386)).replaceAll(' ', '_');
}
// ##############################################################
function getBlofeldPatchCategory(sysexData) {
  return soundCategories[sysexData[386]];
}

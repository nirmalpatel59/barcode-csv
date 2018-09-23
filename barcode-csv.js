const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const moment = require('moment')
const Json2csv = require('json2csv').Parser
const readFileAsync = promisify(fs.readFile)

const dirPath = '/home/nirmal/codebase/barcode-csv/files'
const outputFileName = 'User_' + moment().format('YYYYMMDD_HHmmss') + '.csv'
const outputPath = '/home/nirmal/codebase/barcode-csv/output/' + outputFileName
const searchFiles = function (dirPath, callback) {
  let filesArray = []
  fs.readdir(dirPath, function (err, data) {
    if (err) {
      console.log(err)
      callback(err)
    } else {
      let datalen = data.length
      if (datalen === 0) {
        callback(null, filesArray)
      } else {
        data.forEach(file => {
          var filePath = path.resolve(dirPath, file)
          var isDirectory = fs.lstatSync(filePath).isDirectory()
          if (isDirectory) {
            searchFiles(filePath, function (err, res) {
              if (err) return callback(err)
              filesArray = filesArray.concat(res)
              if (!--datalen) callback(null, filesArray)
            })
          } else {
            filesArray.push(filePath)
            if (!--datalen) callback(null, filesArray)
          }
        })
      }
    }
  })
}

searchFiles(dirPath, async function (err, data) {
  if (err) {
    console.log(err)
  } else {
    if (data && data.length > 0) {
      let barcodeData = await generateCSVData(data)
      const fields = ['Barcode#', 'FullName']
      // let csv = json2csv({ data: barcodeData, fields: fields })
      const json2csvParser = new Json2csv({ fields })
      const csv = json2csvParser.parse(barcodeData)
      console.log(csv)
      fs.writeFile(outputPath, csv, function (err, data) {
        if (err) console.log(err)
        else console.log('File successfully created.')
      })
    } else {
      console.log('No Data found')
    }
  }
})

const generateCSVData = async function (data) {
  var barcodeData = []
  await Promise.all(data.map(async file => {
    let barcodeObj = {}
    let barcodeNum = file.split('/')
    barcodeNum = barcodeNum[barcodeNum.length - 1]
    barcodeNum = barcodeNum.split('.')[0]
    barcodeNum = barcodeNum.split('_')
    barcodeNum = barcodeNum[barcodeNum.length - 1]
    barcodeNum = (Buffer.from(barcodeNum, 'base64')).toString()
    barcodeObj['Barcode#'] = barcodeNum
    let content = await readFileAsync(file)
    if (content) {
      barcodeObj['FullName'] = extractDetailsFromBarcodeFile(content)
    } else {
      barcodeObj['FullName'] = ''
    }
    barcodeData.push(barcodeObj)
  }))
  return barcodeData
}

const extractDetailsFromBarcodeFile = function (content) {
  content = content.toString()
  let contentArray = content.split('\n')
  let fnVal
  let lnVal
  let firstName, lastName
  for (let c = 0; c < contentArray.length; c++) {
    let fnPattern = new RegExp('firstname:', 'ig')
    let lnPattern = new RegExp('lastname:', 'ig')
    fnVal = fnPattern.test(contentArray[c])
    lnVal = lnPattern.test(contentArray[c])
    if (fnVal) firstName = contentArray[c].substring(fnPattern.lastIndex).trim()
    if (lnVal) lastName = contentArray[c].substring(lnPattern.lastIndex).trim()
  }
  return ((firstName || '') + (lastName || ''))
}

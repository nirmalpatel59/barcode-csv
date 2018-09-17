const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const readFileAsync = promisify(fs.readFile)

const dirPath = '/home/nirmal/codebase/barcode-csv/files'
const searchFiles = function (dirPath, callback) {
  let filesArray = []
  fs.readdir(dirPath, function (err, data) {
    if (err) {
      console.log(err)
      callback(err)
    } else {
      console.log(data)
      let datalen = data.length
      if (datalen === 0) {
        callback(null, filesArray)
      } else {
        data.forEach(file => {
          var filePath = path.resolve(dirPath, file)
          var isDirectory = fs.lstatSync(filePath).isDirectory()
          console.log(isDirectory)
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
    console.log(data)
    var barcodeData = []
    if (data && data.length > 0) {
      generateCSVData(data)
    } else {
      console.log('No Data found')
    }
  }
})

const generateCSVData = function (data) {
  data.forEach(async file => {
    let content = await readFileAsync(file)
    if (content) {
      extractDetailsFromBarcodeFile(content)
    } else {

    }
  })
}

const extractDetailsFromBarcodeFile = function (content) {
  content = content.toString()
  let contentArray = content.split('\n')
  for (let c = 0; c < contentArray.length; c++) {
    if(contentArray[c].startsWith())
  }
  let fnPattern = new RegExp('firstname:', 'ig')
  let lnPattern = new RegExp('lastname:', 'ig')
  let fnVal = fnPattern.test(content)
  fnVal = content.substring(fnPattern.lastIndex, content.indexOf('\n'))
}

FileSearch recursiuvely
  - input directory path exists or not
  - search file Bcode_*.txt recursiuvely
  - decode base64 encoding of file barcode name
  - if decode fails then skip the file

Extract Information
  - search tag value firstName (case insensitive) in file
  - search tag value lastName (case insensitive) in file
  - create full name (firstName lastName)


Generate CSV
  - combine all details in one array
  - generate CSV 


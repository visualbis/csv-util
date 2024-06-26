import React, { Component } from 'react';
import XLSX from 'xlsx';
import { make_cols } from './MakeColumns';
import { SheetJSFT } from './types';
import * as FileSaver from 'file-saver';
import './excelReader.css';
import download from './icons/download-icon.svg'
import warningIcon from './icons/warning-icon.svg'
import errorIcon from './icons/error-icon.svg'



class ExcelReader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      file: {},
      data: [],
      cols: [],
      showDownload: false,
      warningList: [],
      warningString: '',
      isError: false
    };
    this.handleFile = this.handleFile.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    const files = e.target.files;
    const acceptedFormats = [ 'csv', 'xlsx' ];
    // console.log('files', files);
    if(files && files[0] && acceptedFormats.includes(files[0].name.split('.').pop().toLowerCase())) {
        this.setState({ file: files[0], showDownload:true, isError: false});
    } else {
      this.setState({ isError: true })
      // throw new Error("File format not accepted");
    }
  }

  isValidHttpUrl(string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }

    return url.protocol === 'http:' || url.protocol === 'https:';
  }

 async toDataUrl(url) {
    return await new Promise(async function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.onload = await function () {
            var reader = new FileReader();
                  reader.onloadend = async function () {
                    var status = xhr.status;
                    if (status === 200) {
                        await resolve(reader.result);
                    } else {
                        reject(status);
                    }
      };
       reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.send();
    });
  }

  async dataUpdation(dataset) {
    const newDataArray = []; // Array to store updated data objects
    let warning = []
    let warningStr = '';
    for await (const data of dataset) {
      const newData = { ...data }; // Clone the original data object
      for await (const key of Object.keys(data)) {
        if (this.isValidHttpUrl(data[key])) {
          await this.toDataUrl(data[key]).then(res => {
            newData[`base64URL_${key}`] = res; // Add the converted URL as a new property
            if (res.length * 3 / 4 > 23000) {
              warning.push(data[key]);
            }
          });

        }
      }
      newDataArray.push(newData); // Push the updated object to the newDataArray  
    }

    for (let i = 0; i < warning.length; i++) {
      warningStr += `${warning[i]}\n`;
    }

    this.setState({ warningList: warning, warningString: warningStr });


    return new Promise((resolve) => {
      resolve(newDataArray); // Resolve with the array of updated data objects
    });

  }

  async handleFile() {
    /* Boilerplate to set up FileReader */
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;

    reader.onload = async (e) => {
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, {
        type: rABS ? 'binary' : 'array',
        bookVBA: true,
      });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_json(ws);
      // console.log('this.state.file', this.state.file);
      var extension = this.state.file.name.split('.').pop().toLowerCase();
      /* Update state */
    this.dataUpdation(data).then(datum => {
        // console.log('datum', datum);
              this.setState({ data: datum, cols: make_cols(ws['!ref']) }, () => {
        // console.log(JSON.stringify(this.state.data, null, 2));
       this.exportAsExcelFile(this.state.data, this.state.file.name, extension);
      });
    })
    };

    if (rABS) {
      reader.readAsBinaryString(this.state.file);
    } else {
      reader.readAsArrayBuffer(this.state.file);
    }
  }

  exportAsExcelFile(json, excelFileName, extension) {
    // console.log(json);
    const worksheet = XLSX.utils.json_to_sheet(json);
    // console.log('worksheet', worksheet);
    const workbook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const EXCEL_TYPE =
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const EXCEL_EXTENSION = '.xlsx';
//   const CSV_TYPE ='text/csv;charset=utf-8';
    const CSV_EXTENSION = '.csv';
if(extension === 'csv') {
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    FileSaver.saveAs(new Blob([csvOutput]), `${excelFileName}_export_${new Date().getTime()}${CSV_EXTENSION}`);
} else {
    const data = new Blob([excelBuffer], {
        type: EXCEL_TYPE,
      });
      FileSaver.saveAs(
        data,
        excelFileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
      );
}
  }

  render() {
    return (
      <div className='main-icon-container' style={{
      }}>
        <div className='upload-outer'>
          <input
            type="file"
            className="form-control"
            id="upload-file"
            accept={SheetJSFT}
            onChange={this.handleChange}
          />
          <label htmlFor="upload-file" style={{
            borderRadius: '20px', border: '2px solid var(--primaryText, #444)',
            background: '#FCFCFC', padding: '5px 40px', fontFamily: "Azeret Mono", fontSize: '16px', fontStyle: 'normal',
            fontWeight: '500', lineHeight: '13px', textAlign: 'center'
          }}>Upload File</label>
          <div class="error-container" style={{display: this.state.isError ? 'flex' : 'none'}}>
            <img class="error-icon" src={errorIcon} alt="Error Icon" />
            <p class="error-text">Not Valid File Format</p>
          </div>
        </div>
        <div className='download-component'>

          <div style={{ display: this.state.showDownload && !this.state.isError ? 'block' : 'none' }} type="submit"
            value='Download'
            onClick={this.handleFile}>
            <img src={download} alt="Download Icon"></img>

          </div>

        </div>
        <div className="warning-container" style={{
          display: this.state.warningList.length > 0 && !this.state.isError ? 'flex' : 'none', color: 'var(--yellow-700, #B45309)',
          fontFamily: "Noto Sans", fontSize: '14px', fontStyle: 'normal', fontWeight: '400', lineHeight: '20px'
        }}>
          <img className="warning-icon" src={warningIcon} alt="Warning Icon" />
          <div style={{ display: 'flex', alignItems: 'center' }}>
          <p className="warning-text">Warning : The images exceed 23kb</p>
          {this.state.warningList.length > 0 ? <p style={{ marginLeft: '10px', width:'25%', overflowY: 'scroll', border:'#FFCD3D 2px solid', height:'60px'}}>{this.state.warningString}</p> : null}
        </div>
      </div>
      </div>
    );
  }
}

export default ExcelReader;

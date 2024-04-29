import './App.css';
import ExcelReader from './ExcelReader';
import xvizLogoTop from './icons/top-xvizIcon.svg'
import xvizLogoBottom from './icons/bottom-xviz-icon.svg'

function App() {
  return (
    <div className="App">
      <div className='mid-component'>
        <div className='title-header'>
          <img className='top-xvizLogo' src={xvizLogoTop} alt="Top xViz Icon"></img>
        </div>
        <div>
          <div className='base64Title'>
            <h2 style={{ fontSize: '25px', lineHeight: 1.25 }}>Excel and Csv File Convert to Base64</h2>
            <p>
              Quickly transform XLS/CSV image URLs into base64 format with our xViz converter.
            </p>
          </div>
          <div className='uploadTitle'>
            <p>
              Convert your spreadsheet files containing image URLs into base64 encoded format.
            </p>
          </div>
          <ExcelReader/>
        </div>
      </div>
      <div className='user-guide'>
        <h2 style={{textAlign:'center'}}>Guide to use</h2>
        <ol>
          <li>Upload a file (xIsx or csv) containing the list of your https links</li>
          <li>Ensure to include a column header</li>
          <li>We recommend using images that have a file size of &lt;23 KB as individual image files. Otherwise, the Base 64 URL will be longer than the maximum characters that Power Bl can support.</li>
          <li>If you do have images  &gt;23KB, then refer to this hack to handle long Base64 URLS in your Power BI model.</li>
          <li>If we encounter any images  &gt;23KB, then we will highlight those images for you on the screen, during the download.</li>
          <li>This will enable you to identify and take corrective actions for those files</li>
        </ol>
      </div>
      <div className='footer'>
        <img className='bottom-xvizLogo' src={xvizLogoBottom} alt="Bottom xviz Icon"></img>

      </div>
    </div>
  );
}

export default App;

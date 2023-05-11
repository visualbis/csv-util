import './App.css';
import ExcelReader from './ExcelReader';

function App() {
  return (
    <div className="App" style = {{display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'}}>
     <ExcelReader/>
    </div>
  );
}

export default App;

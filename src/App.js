import logo from './logo.svg';
import './App.css';
import { Circle as CircleStyle, Fill, Stroke, Style, RegularShape } from 'ol/style.js';

import BaseMap from './Components/BaseMap';

function App() {
  return (
    <div className="App">
      <BaseMap/>
    </div>
  );
}

export default App;

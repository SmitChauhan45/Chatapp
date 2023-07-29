import axios from "axios";
import { UserContextProvider } from "./UserContext";
import { Routes } from './Routes'

function App() {
  // const [count, setCount] = useState(0)
  axios.defaults.baseURL = "http://localhost:4000";
  axios.defaults.withCredentials = true;

  return (
    <UserContextProvider>
      <Routes></Routes>
    </UserContextProvider>)
}

export default App;

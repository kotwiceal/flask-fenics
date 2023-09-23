import {createRoot} from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import App from './app'

const div = document.createElement('div')
document.body.appendChild(div)
const root = createRoot(div)
root.render(<App/>)


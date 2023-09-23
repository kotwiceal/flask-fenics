import {TaskContainer} from './task'
import {io} from 'socket.io-client'

const socket = io('/solver', {autoConnect: true})

const App = () => {
    document.querySelector('html').setAttribute('data-bs-theme', 'dark')
    return (
        <>
            <TaskContainer socket = {socket} header = 'Flow past a cylinder'/>
        </>
    )
}

export default App
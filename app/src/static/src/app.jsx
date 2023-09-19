import {TaskContainer} from './task'

const App = () => {
    document.querySelector('html').setAttribute('data-bs-theme', 'dark')
    return (
        <>
            <TaskContainer header = 'Flow past a cylinder'/>
        </>
    )
}

export default App